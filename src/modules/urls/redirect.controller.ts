import { Request, Response } from 'express';
import axios from 'axios';
import useragent from 'useragent';
import { urlRepository } from './url.repository';
import { clickRepository } from '../analytics/click.repository';
import { hashIP } from '../../shared/utils/ipHasher';
import { AppError } from '../../shared/utils/AppError';

const lookUpLocation = async (ip: string) => {
  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}?fields=country,city,regionName`, { timeout: 2000 });
    return {
      country: data.country ?? '',
      city: data.city ?? '',
      region: data.regionName ?? '',
    };
  } catch {
    return { country: '', city: '', region: '' };
  }
};

export const redirectController = {
  async redirect(req: Request, res: Response) {
    const { shortCode } = req.params;

    const url = await urlRepository.findByShortCode(shortCode);
    if (!url) {
      throw new AppError('URL not found', 404);
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      throw new AppError('URL has expired', 410);
    }

    const originalUrl = url.originalUrl;

    urlRepository.incrementClicks(url._id.toString());

    const clientIP = req.ip ?? req.socket.remoteAddress ?? '';
    const hashedIP = hashIP(clientIP);
    const agent = useragent.parse(req.headers['user-agent'] ?? '');
    const referer = req.headers['referer'] ?? '';

    lookUpLocation(clientIP).then((loc) => {
      clickRepository.create({
        urlId: url._id.toString(),
        shortCode,
        hashedIP,
        userAgent: req.headers['user-agent'] ?? '',
        deviceType: agent.device.toString(),
        browser: agent.family,
        os: agent.os.toString(),
        referer: referer as string,
        country: loc.country,
        city: loc.city,
        region: loc.region,
      });
    });

    res.redirect(302, originalUrl);
  },
};
