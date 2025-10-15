import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { AuthUser } from '../models/user.js';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  ver: number;
}

export interface RefreshTokenPayload {
  sub: string;
  typ: string;
  jti: string;
  iat: number;
  exp: number;
}

export function signAccessToken(user: AuthUser): string {
  const payload = {
    sub: user.id,
    role: user.role,
    ver: 1, // Version for future invalidation strategy
  };

  return jwt.sign(payload, config.auth.jwt.accessSecret, {
    expiresIn: config.auth.jwt.accessTokenExpiry,
  });
}

export function signRefreshToken(user: AuthUser): string {
  const payload = {
    sub: user.id,
    typ: 'refresh',
    jti: `${user.id}_${Date.now()}`, // Simple jti for tracking
  };

  return jwt.sign(payload, config.auth.jwt.refreshSecret, {
    expiresIn: config.auth.jwt.refreshTokenExpiry,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.auth.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.auth.jwt.refreshSecret) as RefreshTokenPayload;
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
): void {
  // Access token cookie (short-lived)
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: config.auth.cookie.httpOnly,
    secure: config.auth.cookie.secure,
    sameSite: 'lax',
    maxAge: config.auth.cookie.accessTokenMaxAge,
    path: '/',
  });

  // Refresh token cookie (long-lived)
  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: config.auth.cookie.httpOnly,
    secure: config.auth.cookie.secure,
    sameSite: 'strict',
    maxAge: config.auth.cookie.refreshTokenMaxAge,
    path: '/',
  });
}

export function clearAuthCookies(res: Response): void {
  res.cookie('access_token', '', {
    httpOnly: config.auth.cookie.httpOnly,
    secure: config.auth.cookie.secure,
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });

  res.cookie('refresh_token', '', {
    httpOnly: config.auth.cookie.httpOnly,
    secure: config.auth.cookie.secure,
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
}
