import { urlRepository, type UrlRecord } from './url.repository';
import { generateSlug } from '../../shared/utils/slugGenerator';
import { AppError } from '../../shared/utils/AppError';

export const urlService = {
  async create(data: { originalUrl: string; customSlug?: string; expiresAt?: string; userId: string }): Promise<UrlRecord> {
    const shortCode = data.customSlug ?? generateSlug();

    if (data.customSlug) {
      const existing = await urlRepository.findByShortCode(data.customSlug);
      if (existing) {
        throw new AppError('Custom slug already taken', 409);
      }
    }

    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    return urlRepository.create({
      originalUrl: data.originalUrl,
      shortCode,
      userId: data.userId,
      expiresAt,
    });
  },

  async list(userId: string, page: number, limit: number) {
    const { urls, total } = await urlRepository.findByUser(userId, page, limit);
    return {
      urls,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string, userId: string) {
    const url = await urlRepository.findById(id, userId);
    if (!url) {
      throw new AppError('URL not found', 404);
    }
    return {
      id: url._id.toString(),
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clicks: url.clicks,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      deletedAt: url.deletedAt,
    };
  },

  async delete(id: string, userId: string) {
    const deleted = await urlRepository.softDelete(id, userId);
    if (!deleted) {
      throw new AppError('URL not found', 404);
    }
  },
};
