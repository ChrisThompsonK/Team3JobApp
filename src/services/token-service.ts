import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '../models/user.js';

// Helper to extract base64 secrets
function getSecret(envSecret: string): string {
  if (envSecret.startsWith('base64:')) {
    return envSecret.substring(7); // Remove 'base64:' prefix
  }
  return envSecret;
}

const accessSecret = getSecret(process.env['JWT_ACCESS_SECRET'] || 'fallback-secret-access');
const refreshSecret = getSecret(process.env['JWT_REFRESH_SECRET'] || 'fallback-secret-refresh');

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

  return jwt.sign(payload, accessSecret, { expiresIn: '15m' });
}

export function signRefreshToken(user: AuthUser): string {
  const payload = {
    sub: user.id,
    typ: 'refresh',
    jti: `${user.id}_${Date.now()}`, // Simple jti for tracking
  };

  return jwt.sign(payload, refreshSecret, { expiresIn: '30d' });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, refreshSecret) as RefreshTokenPayload;
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
): void {
  const isProduction = process.env['NODE_ENV'] === 'production';

  // Access token cookie (short-lived)
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    path: '/',
  });

  // Refresh token cookie (long-lived)
  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    path: '/',
  });
}

export function clearAuthCookies(res: Response): void {
  res.cookie('access_token', '', {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });

  res.cookie('refresh_token', '', {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
}
