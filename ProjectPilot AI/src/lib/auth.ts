import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
const ACCESS_TOKEN_EXP = '15m'; // 15 minutes short-lived
const REFRESH_TOKEN_EXP = '7d'; // 7 days persistent

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function generateTokens(user: { id: string; email: string; role: string; name: string }) {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXP });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXP });

  return { accessToken, refreshToken };
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  cookieStore.set({
    name: 'access_token',
    value: accessToken,
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60, // 15 minutes in seconds
  });

  cookieStore.set({
    name: 'refresh_token',
    value: refreshToken,
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set('access_token', '', { maxAge: 0, path: '/' });
  cookieStore.set('refresh_token', '', { maxAge: 0, path: '/' });
  try {
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
  } catch {
    // Suppress if delete fails in read-only scope
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (accessToken) {
    const decoded = verifyToken(accessToken);
    if (decoded) {
      return decoded;
    }
  }

  // Fallback: check refresh token
  const refreshToken = cookieStore.get('refresh_token')?.value;
  if (!refreshToken) return null;

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as { id: string };
    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, name: true, avatarUrl: true },
    });
    if (!user) return null;

    // Issue refreshed tokens in outgoing cookie store if allowed in current context
    try {
      const tokens = generateTokens(user);
      await setAuthCookies(tokens.accessToken, tokens.refreshToken);
    } catch {
      // Ignore if called inside read-only Server Component rendering
    }

    return user;
  } catch {
    return null;
  }
}
