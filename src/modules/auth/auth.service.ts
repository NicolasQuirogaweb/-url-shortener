import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { authRepository, type SafeUser } from './auth.repository';
import { formatDate } from '../../shared/utils/dateFormatter';
import { AppError } from '../../shared/utils/AppError';
import type { JwtPayload } from '../../shared/types';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const signAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const signRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const authService = {
  async register(email: string, password: string): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await authRepository.create(email, hashedPassword);

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    await authRepository.updateRefreshToken(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  },

  async login(email: string, password: string): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.password) {
      throw new AppError('Invalid email or password', 401);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    await authRepository.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user: { id: user._id.toString(), email: user.email, createdAt: formatDate(user.createdAt)! },
      accessToken,
      refreshToken,
    };
  },

  async refresh(oldRefreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await authRepository.findById(payload.userId);
    if (!user || user.refreshToken !== oldRefreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    await authRepository.updateRefreshToken(user._id.toString(), refreshToken);

    return { accessToken, refreshToken };
  },

  async googleLogin(googleUser: { userId: string; email: string }): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const accessToken = signAccessToken(googleUser.userId);
    const refreshToken = signRefreshToken(googleUser.userId);
    await authRepository.updateRefreshToken(googleUser.userId, refreshToken);

    return {
      user: { id: googleUser.userId, email: googleUser.email, createdAt: '' },
      accessToken,
      refreshToken,
    };
  },

  async logout(userId: string) {
    await authRepository.updateRefreshToken(userId, null);
  },
};
