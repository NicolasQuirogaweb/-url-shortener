import { analyticsRepository, type AnalyticsResult } from './analytics.repository';
import { urlRepository } from '../urls/url.repository';
import { AppError } from '../../shared/utils/AppError';

export const analyticsService = {
  async getAnalytics(urlId: string, userId: string, from?: string, to?: string, groupBy = 'day'): Promise<AnalyticsResult> {
    const url = await urlRepository.findById(urlId, userId);
    if (!url) {
      throw new AppError('URL not found', 404);
    }

    const now = new Date();
    const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : now;

    if (!['day', 'week', 'month'].includes(groupBy)) {
      throw new AppError('groupBy must be day, week, or month', 400);
    }

    return analyticsRepository.getAnalytics(urlId, fromDate, toDate, groupBy);
  },
};
