import { Request, Response } from 'express';
import { urlService } from './url.service';
import { createUrlSchema } from './url.schema';

export const urlController = {
  async create(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const data = createUrlSchema.parse(req.body);
    const url = await urlService.create({ ...data, userId });

    res.status(201).json({ success: true, data: url, error: null });
  },

  async list(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const result = await urlService.list(userId, page, limit);

    res.json({ success: true, data: result.urls, meta: result.meta, error: null });
  },

  async getById(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const url = await urlService.getById(req.params.id, userId);

    res.json({ success: true, data: url, error: null });
  },

  async delete(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    await urlService.delete(req.params.id, userId);

    res.json({ success: true, data: null, error: null });
  },
};
