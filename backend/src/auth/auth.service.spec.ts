import { ConfigService } from '@nestjs/config';
import type { Repository, SelectQueryBuilder } from 'typeorm';
import { AuthService } from './auth.service.js';
import { User } from './entities/user.entity.js';

describe('AuthService', () => {
  const savedUser: User = {
    id: '73aa887f-af1e-4ca8-99f2-47b8a55d109c',
    name: 'Sam Taylor',
    email: 'sam@example.com',
    passwordHash: '',
    createdAt: new Date('2026-10-14T00:00:00Z'),
  };

  const createService = () => {
    const createUser = vi.fn((value: Partial<User>) =>
      Object.assign(new User(), savedUser, value),
    );
    const createQueryBuilder = vi.fn();
    const repository = {
      findOne: vi.fn().mockResolvedValue(null),
      create: createUser,
      save: vi.fn((value: User) => Promise.resolve(value)),
      createQueryBuilder,
    } as unknown as Repository<User>;
    const config = {
      getOrThrow: vi
        .fn()
        .mockReturnValue('test-secret-that-is-at-least-32-characters'),
    } as unknown as ConfigService;
    return {
      service: new AuthService(repository, config),
      createUser,
      createQueryBuilder,
    };
  };

  it('registers a user with a hashed password and returns a valid session', async () => {
    const { service, createUser } = createService();
    const session = await service.register({
      name: '  Sam Taylor  ',
      email: ' SAM@Example.com ',
      password: 'password123',
    });

    expect(session.user.email).toBe('sam@example.com');
    expect(session.accessToken.split('.')).toHaveLength(3);
    expect(service.verifyToken(session.accessToken).sub).toBe(savedUser.id);
    const created = createUser.mock.calls[0][0] as User;
    expect(created.passwordHash).toMatch(/^scrypt\$/);
    expect(created.passwordHash).not.toContain('password123');
  });

  it('rejects invalid credentials', async () => {
    const { service, createQueryBuilder } = createService();
    const queryBuilder = {
      addSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(null),
    } as unknown as SelectQueryBuilder<User>;
    createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(
      service.login({ email: 'nobody@example.com', password: 'password123' }),
    ).rejects.toThrow('Invalid email or password');
  });

  it('rejects a tampered token', async () => {
    const { service } = createService();
    const session = await service.register({
      name: 'Sam Taylor',
      email: 'sam@example.com',
      password: 'password123',
    });

    expect(() =>
      service.verifyToken(`${session.accessToken.slice(0, -1)}x`),
    ).toThrow('Your session is invalid or has expired');
  });
});
