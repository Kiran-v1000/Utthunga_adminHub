import jwt from 'jsonwebtoken';
import { prisma } from '@/config/db';
import { getAuthCodeUrl, acquireTokenByCode } from '@/config/msal';
import type { JwtPayload, TokenPair } from '@adminhub/shared';
import { addDays } from 'date-fns';

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

export async function getMsalLoginUrl() {
  return getAuthCodeUrl();
}

export async function handleMsalCallback(code: string): Promise<TokenPair> {
  const result = await acquireTokenByCode(code);
  if (!result?.account) throw Object.assign(new Error('MSAL auth failed'), { status: 401 });

  const azureAdId = result.account.homeAccountId;
  const email = result.account.username;
  const name = result.account.name ?? email;

  let user = await prisma.user.findUnique({ where: { azureAdId } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({ where: { id: user.id }, data: { azureAdId } });
    } else {
      user = await prisma.user.create({
        data: { azureAdId, email, name, role: 'EMPLOYEE', officeLocation: 'BANGALORE' },
      });
    }
  }

  return issueTokenPair(user);
}

export async function issueTokenPair(user: { id: string; email: string; role: string; officeLocation: string }) {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as JwtPayload['role'],
    officeLocation: user.officeLocation as JwtPayload['officeLocation'],
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: addDays(new Date(), 7) },
  });

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw Object.assign(new Error('Refresh token expired'), { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) throw Object.assign(new Error('User not found'), { status: 401 });

  const accessToken = signAccessToken({
    userId: user.id, email: user.email,
    role: user.role as JwtPayload['role'],
    officeLocation: user.officeLocation as JwtPayload['officeLocation'],
  });
  return { accessToken };
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}
