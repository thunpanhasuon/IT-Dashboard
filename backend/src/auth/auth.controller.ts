import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './public.decorator.js';

interface LoginRequest {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: LoginRequest) {
    return this.authService.login(dto, this.clientIp(request));
  }

  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.getUser(request.user!.id);
  }

  private clientIp(request: LoginRequest) {
    const forwarded = request.headers['x-forwarded-for'];
    const firstForwarded = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded?.split(',')[0];
    return firstForwarded?.trim() || request.ip || 'unknown';
  }
}
