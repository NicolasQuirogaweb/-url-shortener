import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createUrlSchema = z.object({
  originalUrl: z.string().url(),
  customSlug: z.string().regex(/^[a-zA-Z0-9_-]{4,16}$/).optional(),
  expiresAt: z.string().regex(dateRegex, 'Use formato YYYY-MM-DD (ej: 2026-12-31)').optional(),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
