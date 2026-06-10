import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as authService from './auth.service';
import { prisma } from '@/config/db';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export async function login(req: Request, res: Response) {
  const url = await authService.getMsalLoginUrl();
  res.json({ success: true, data: { url } });
}

export async function callback(req: Request, res: Response) {
  const { code } = req.query as { code: string };
  if (!code) return res.status(400).json({ success: false, error: 'Missing code' });

  const { accessToken, refreshToken } = await authService.handleMsalCallback(code);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({ success: true, data: { accessToken } });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ success: false, error: 'No refresh token' });

  const { accessToken } = await authService.refreshAccessToken(token);
  res.json({ success: true, data: { accessToken } });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (token) await authService.revokeRefreshToken(token);
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ success: true });
}

export async function localLogin(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, error: 'Account deactivated' });
  }

  const { accessToken, refreshToken } = await authService.issueTokenPair(user);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({ success: true, data: { accessToken } });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, email: true, name: true, role: true,
      officeLocation: true, employeeId: true, department: true,
      designation: true, buId: true, avatar: true,
    },
  });
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, data: user });
}
