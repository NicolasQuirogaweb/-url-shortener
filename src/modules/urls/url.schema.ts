import { z } from 'zod';

export const createUrlSchema = z.object({
  originalUrl: z.string().url(),
  customSlug: z.string().regex(/^[a-zA-Z0-9_-]{4,16}$/).optional(),
  expiresAt: z.string().datetime().optional(),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
