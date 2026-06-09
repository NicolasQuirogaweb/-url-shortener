import { Request, Response } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { AppError } from '../../shared/utils/AppError';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  async register(req: Request, res: Response) {
    const { email, password } = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.register(email, password);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      data: { user, accessToken },
      error: null,
    });
  },

  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({
      success: true,
      data: { user, accessToken },
      error: null,
    });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new AppError('Refresh token not provided', 401);
    }

    const { accessToken, refreshToken } = await authService.refresh(token);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({
      success: true,
      data: { accessToken },
      error: null,
    });
  },

  async logout(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (userId) {
      await authService.logout(userId);
    }

    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    res.json({
      success: true,
      data: null,
      error: null,
    });
  },
};
