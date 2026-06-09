import mongoose from 'mongoose';
import { Click } from './click.model';

export interface AnalyticsResult {
  totalClicks: number;
  uniqueClicks: number;
  byDevice: { label: string; count: number }[];
  byBrowser: { label: string; count: number }[];
  byOs: { label: string; count: number }[];
  byCountry: { label: string; count: number }[];
  byReferrer: { label: string; count: number }[];
  timeline: { date: string; count: number }[];
}

const dateFormatMap: Record<string, string> = {
  day: '%Y-%m-%d',
  week: '%Y-%W',
  month: '%Y-%m',
};

export const analyticsRepository = {
  async getAnalytics(
    urlId: string,
    from: Date,
    to: Date,
    groupBy: string,
  ): Promise<AnalyticsResult> {
    const oid = new mongoose.Types.ObjectId(urlId);
    const dateFormat = dateFormatMap[groupBy] ?? dateFormatMap.day;

    const [result] = await Click.aggregate([
      { $match: { urlId: oid, timestamp: { $gte: from, $lte: to } } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          unique: [{ $group: { _id: '$hashedIP' } }, { $count: 'count' }],
          byDevice: [{ $group: { _id: '$deviceType', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          byBrowser: [{ $group: { _id: '$browser', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          byOs: [{ $group: { _id: '$os', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          byCountry: [{ $group: { _id: '$country', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          byReferrer: [{ $group: { _id: '$referer', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          timeline: [
            {
              $group: {
                _id: { $dateToString: { format: dateFormat, date: '$timestamp' } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: '$_id', count: 1 } },
          ],
        },
      },
      {
        $project: {
          totalClicks: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
          uniqueClicks: { $ifNull: [{ $arrayElemAt: ['$unique.count', 0] }, 0] },
          byDevice: { $map: { input: '$byDevice', as: 'd', in: { label: '$$d._id', count: '$$d.count' } } },
          byBrowser: { $map: { input: '$byBrowser', as: 'd', in: { label: '$$d._id', count: '$$d.count' } } },
          byOs: { $map: { input: '$byOs', as: 'd', in: { label: '$$d._id', count: '$$d.count' } } },
          byCountry: { $map: { input: '$byCountry', as: 'd', in: { label: '$$d._id', count: '$$d.count' } } },
          byReferrer: { $map: { input: '$byReferrer', as: 'd', in: { label: '$$d._id', count: '$$d.count' } } },
          timeline: '$timeline',
        },
      },
    ]);

    return result ?? {
      totalClicks: 0,
      uniqueClicks: 0,
      byDevice: [],
      byBrowser: [],
      byOs: [],
      byCountry: [],
      byReferrer: [],
      timeline: [],
    };
  },
};
