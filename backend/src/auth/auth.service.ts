import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto.js';
import { LoginAttempt } from './entities/login-attempt.entity.js';
import type { AuthUser, JwtPayload } from './auth.types.js';

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 8;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_RETENTION_MS = 24 * 60 * 60 * 1000;
const MAX_FAILURES_PER_EMAIL = 10;
const MAX_FAILURES_PER_IP = 25;
const ADMIN_ID = '00000000-0000-4000-8000-000000000001';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly adminEmail: string;
  private readonly adminName: string;
  private readonly adminPasswordDigest: Buffer;

  constructor(
    @InjectRepository(LoginAttempt)
    private readonly attempts: Repository<LoginAttempt>,
    config: ConfigService,
  ) {
    this.jwtSecret = config.getOrThrow<string>('JWT_SECRET');
    if (this.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters');
    }

    this.adminEmail = config
      .getOrThrow<string>('ADMIN_EMAIL')
      .trim()
      .toLowerCase();
    this.adminName = config.get<string>('ADMIN_NAME', 'Administrator').trim();
    const adminPassword = config.getOrThrow<string>('ADMIN_PASSWORD');
    if (adminPassword.length < 20) {
      throw new Error('ADMIN_PASSWORD must contain at least 20 characters');
    }
    this.adminPasswordDigest = this.passwordDigest(adminPassword);
  }

  async login(dto: LoginDto, clientIp = 'unknown') {
    const email = dto.email.trim().toLowerCase();
    const ip = clientIp.slice(0, 64) || 'unknown';
    await this.enforceRateLimit(email, ip);

    const passwordDigest = this.passwordDigest(dto.password);
    const validCredentials =
      email === this.adminEmail &&
      passwordDigest.length === this.adminPasswordDigest.length &&
      timingSafeEqual(passwordDigest, this.adminPasswordDigest);

    if (!validCredentials) {
      await this.recordFailure(email, ip);
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.attempts.delete({ email });
    return this.createSession(this.getAdminUser());
  }

  getUser(userId: string): AuthUser {
    if (userId !== ADMIN_ID) {
      throw new UnauthorizedException('Account no longer exists');
    }
    return this.getAdminUser();
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
      ) as { alg?: string; typ?: string };
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString(),
      ) as JwtPayload;
      if (
        header.alg !== 'HS256' ||
        header.typ !== 'JWT' ||
        payload.sub !== ADMIN_ID ||
        payload.email !== this.adminEmail ||
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

  private async enforceRateLimit(email: string, ip: string) {
    const attemptedAt = MoreThanOrEqual(
      new Date(Date.now() - RATE_LIMIT_WINDOW_MS),
    );
    const [emailFailures, ipFailures] = await Promise.all([
      this.attempts.count({ where: { email, attemptedAt } }),
      this.attempts.count({ where: { ip, attemptedAt } }),
    ]);

    if (
      emailFailures >= MAX_FAILURES_PER_EMAIL ||
      ipFailures >= MAX_FAILURES_PER_IP
    ) {
      throw new HttpException(
        'Too many login attempts. Try again in 15 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async recordFailure(email: string, ip: string) {
    await this.attempts.save(this.attempts.create({ email, ip }));
    await this.attempts.delete({
      attemptedAt: LessThan(new Date(Date.now() - RATE_LIMIT_RETENTION_MS)),
    });
  }

  private getAdminUser(): AuthUser {
    return {
      id: ADMIN_ID,
      name: this.adminName,
      email: this.adminEmail,
      createdAt: new Date(0),
    };
  }

  private createSession(user: AuthUser) {
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
      user,
    };
  }

  private passwordDigest(password: string) {
    return createHmac('sha256', this.jwtSecret).update(password).digest();
  }

  private encode(value: object) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private sign(value: string) {
    return createHmac('sha256', this.jwtSecret)
      .update(value)
      .digest('base64url');
  }
}
