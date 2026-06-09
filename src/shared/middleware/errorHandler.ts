import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      data: null,
      error: { message: err.message, isOperational: err.isOperational },
    });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    data: null,
    error: { message: 'Internal server error', isOperational: false },
  });
};
