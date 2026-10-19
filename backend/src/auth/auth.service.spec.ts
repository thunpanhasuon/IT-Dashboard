import { ConfigService } from '@nestjs/config';
import type { Repository } from 'typeorm';
import { AuthService } from './auth.service.js';
import { LoginAttempt } from './entities/login-attempt.entity.js';

describe('AuthService', () => {
  const adminPassword = 'correct-horse-battery-staple-123';

  const createService = () => {
    const attempts = {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn((value: Partial<LoginAttempt>) => value),
      save: vi.fn((value: LoginAttempt) => Promise.resolve(value)),
      delete: vi.fn().mockResolvedValue({ affected: 0, raw: [] }),
    } as unknown as Repository<LoginAttempt>;
    const configValues: Record<string, string> = {
      JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
      ADMIN_EMAIL: 'admin@example.com',
      ADMIN_PASSWORD: adminPassword,
      ADMIN_NAME: 'Test Admin',
    };
    const config = {
      getOrThrow: vi.fn((key: string) => configValues[key]),
      get: vi.fn((key: string, fallback: string) => configValues[key] ?? fallback),
    } as unknown as ConfigService;

    return {
      service: new AuthService(attempts, config),
      attempts,
    };
  };

  it('signs in the configured administrator and returns a valid session', async () => {
    const { service, attempts } = createService();
    const session = await service.login(
      { email: ' ADMIN@example.com ', password: adminPassword },
      '203.0.113.10',
    );

    expect(session.user.email).toBe('admin@example.com');
    expect(session.user.name).toBe('Test Admin');
    expect(session.accessToken.split('.')).toHaveLength(3);
    expect(service.verifyToken(session.accessToken).sub).toBe(session.user.id);
    expect(attempts.delete).toHaveBeenCalledWith({
      email: 'admin@example.com',
    });
  });

  it('records a failed login without revealing which credential was wrong', async () => {
    const { service, attempts } = createService();

    await expect(
      service.login(
        { email: 'nobody@example.com', password: 'wrong-password' },
        '203.0.113.11',
      ),
    ).rejects.toThrow('Invalid email or password');
    expect(attempts.create).toHaveBeenCalledWith({
      email: 'nobody@example.com',
      ip: '203.0.113.11',
    });
    expect(attempts.save).toHaveBeenCalledOnce();
  });

  it('blocks an email after too many recent failures', async () => {
    const { service, attempts } = createService();
    vi.mocked(attempts.count)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(0);

    await expect(
      service.login(
        { email: 'admin@example.com', password: adminPassword },
        '203.0.113.12',
      ),
    ).rejects.toThrow('Too many login attempts');
    expect(attempts.save).not.toHaveBeenCalled();
  });

  it('rejects a tampered token', async () => {
    const { service } = createService();
    const session = await service.login(
      { email: 'admin@example.com', password: adminPassword },
      '203.0.113.13',
    );

    expect(() =>
      service.verifyToken(`${session.accessToken.slice(0, -1)}x`),
    ).toThrow('Your session is invalid or has expired');
  });
});
