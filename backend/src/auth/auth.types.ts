export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}
