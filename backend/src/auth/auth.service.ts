import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { User } from './entities/user.entity.js';
import type { AuthUser, JwtPayload } from './auth.types.js';

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 8;

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    config: ConfigService,
  ) {
    this.jwtSecret = config.getOrThrow<string>('JWT_SECRET');
    if (this.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters');
    }
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findOne({ where: { email } })) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = this.users.create({
      name: dto.name.trim(),
      email,
      passwordHash: await this.hashPassword(dto.password),
    });

    try {
      const saved = await this.users.save(user);
      return this.createSession(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = :email', {
        email: dto.email.trim().toLowerCase(),
      })
      .getOne();

    if (
      !user ||
      !(await this.verifyPassword(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createSession(user);
  }

  async getUser(userId: string): Promise<AuthUser> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Account no longer exists');
    return this.toAuthUser(user);
  }

  verifyToken(token: string): JwtPayload {
    try {
      const [encodedHeader, encodedPayload, encodedSignature, extra] =
        token.split('.');
      if (!encodedHeader || !encodedPayload || !encodedSignature || extra) {
        throw new Error('Malformed token');
      }

      const expected = this.sign(`${encodedHeader}.${encodedPayload}`);
      const receivedBuffer = Buffer.from(encodedSignature);
      const expectedBuffer = Buffer.from(expected);
      if (
        receivedBuffer.length !== expectedBuffer.length ||
        !timingSafeEqual(receivedBuffer, expectedBuffer)
      ) {
        throw new Error('Invalid signature');
      }

      const header = JSON.parse(
        Buffer.from(encodedHeader, 'base64url').toString(),
      ) as {
        alg?: string;
        typ?: string;
      };
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString(),
      ) as JwtPayload;
      if (
        header.alg !== 'HS256' ||
        header.typ !== 'JWT' ||
        typeof payload.sub !== 'string' ||
        typeof payload.exp !== 'number' ||
        payload.exp <= Math.floor(Date.now() / 1000)
      ) {
        throw new Error('Invalid token');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Your session is invalid or has expired');
    }
  }

  private createSession(user: User) {
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: now,
      exp: now + TOKEN_LIFETIME_SECONDS,
    };
    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const body = this.encode(payload);
    const unsignedToken = `${header}.${body}`;

    return {
      accessToken: `${unsignedToken}.${this.sign(unsignedToken)}`,
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  private encode(value: object) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private sign(value: string) {
    return createHmac('sha256', this.jwtSecret)
      .update(value)
      .digest('base64url');
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const key = await this.deriveKey(password, salt);
    return `scrypt$${salt}$${key.toString('hex')}`;
  }

  private async verifyPassword(password: string, stored: string) {
    const [algorithm, salt, hash] = stored.split('$');
    if (algorithm !== 'scrypt' || !salt || !hash) return false;
    const expected = Buffer.from(hash, 'hex');
    const received = await this.deriveKey(password, salt);
    return (
      expected.length === received.length && timingSafeEqual(expected, received)
    );
  }

  private deriveKey(password: string, salt: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, 64, (error, key) =>
        error ? reject(error) : resolve(key),
      );
    });
  }

  private isUniqueViolation(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
