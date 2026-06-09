import { Request, Response, NextFunction } from 'express';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../../config/redis';
import { AppError } from '../utils/AppError';

const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:auth',
});

const redirectLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'ratelimit:redirect',
});

const getClientIP = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? req.socket.remoteAddress ?? 'unknown';
};

export const rateLimitAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const ip = getClientIP(req);
  const { success } = await authLimiter.limit(ip);
  if (!success) {
    throw new AppError('Too many requests. Try again later.', 429);
  }
  next();
};

export const rateLimitRedirect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const ip = getClientIP(req);
  const { success } = await redirectLimiter.limit(ip);
  if (!success) {
    throw new AppError('Too many requests. Try again later.', 429);
  }
  next();
};
