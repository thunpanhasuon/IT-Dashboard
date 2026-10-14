import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard.js';
import { AuthService } from './auth.service.js';

describe('AuthGuard', () => {
  const createGuard = (authorization?: string, isPublic = false) => {
    const request: AuthenticatedRequest = { headers: { authorization } };
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(isPublic),
    } as unknown as Reflector;
    const verifyToken = vi.fn().mockReturnValue({
      sub: 'user-id',
      email: 'sam@example.com',
      name: 'Sam Taylor',
    });
    const authService = { verifyToken } as unknown as AuthService;
    const context = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    return {
      guard: new AuthGuard(reflector, authService),
      context,
      request,
      verifyToken,
    };
  };

  it('allows public routes without a token', () => {
    const { guard, context } = createGuard(undefined, true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects protected routes without a bearer token', () => {
    const { guard, context } = createGuard();
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('attaches the verified user to protected requests', () => {
    const { guard, context, request, verifyToken } =
      createGuard('Bearer valid-token');
    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({
      id: 'user-id',
      email: 'sam@example.com',
      name: 'Sam Taylor',
    });
    expect(verifyToken).toHaveBeenCalledWith('valid-token');
  });
});
