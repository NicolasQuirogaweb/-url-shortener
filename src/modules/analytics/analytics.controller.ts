import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';

export const analyticsController = {
  async getAnalytics(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { from, to, groupBy } = req.query as { from?: string; to?: string; groupBy?: string };

    const data = await analyticsService.getAnalytics(id, userId, from, to, groupBy);
    res.json({ success: true, data, error: null });
  },
};
