import { Url, IUrl } from './url.model';
import { env } from '../../config/env';
import { formatDate } from '../../shared/utils/dateFormatter';

export interface UrlRecord {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  expiresAt: string | null;
  createdAt: string;
  deletedAt: string | null;
}

const toUrlRecord = (doc: IUrl): UrlRecord => ({
  id: doc._id.toString(),
  originalUrl: doc.originalUrl,
  shortCode: doc.shortCode,
  shortUrl: `${env.BASE_URL}/${doc.shortCode}`,
  clicks: doc.clicks,
  expiresAt: formatDate(doc.expiresAt),
  createdAt: formatDate(doc.createdAt)!,
  deletedAt: formatDate(doc.deletedAt),
});

export const urlRepository = {
  async findByShortCode(shortCode: string): Promise<IUrl | null> {
    return Url.findOne({ shortCode, deletedAt: null });
  },

  async findById(id: string, userId: string): Promise<IUrl | null> {
    return Url.findOne({ _id: id, userId, deletedAt: null });
  },

  async findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ urls: UrlRecord[]; total: number }> {
    const filter = { userId, deletedAt: null };
    const [docs, total] = await Promise.all([
      Url.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Url.countDocuments(filter),
    ]);
    return { urls: docs.map(toUrlRecord), total };
  },

  async create(data: {
    originalUrl: string;
    shortCode: string;
    userId: string;
    expiresAt: Date | null;
  }): Promise<UrlRecord> {
    const doc = await Url.create({
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      userId: data.userId,
      expiresAt: data.expiresAt,
    });
    return toUrlRecord(doc);
  },

  async softDelete(id: string, userId: string): Promise<boolean> {
    const result = await Url.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
    );
    return result !== null;
  },

  async incrementClicks(id: string): Promise<void> {
    await Url.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
  },

  async findByIdRaw(id: string): Promise<IUrl | null> {
    return Url.findById(id);
  },
};
