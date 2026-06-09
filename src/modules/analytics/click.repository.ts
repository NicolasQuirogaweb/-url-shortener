import { Click } from './click.model';

export const clickRepository = {
  async create(data: {
    urlId: string;
    shortCode: string;
    hashedIP: string;
    userAgent: string;
    deviceType: string;
    browser: string;
    os: string;
    referer: string;
    country: string;
    city: string;
    region: string;
  }): Promise<void> {
    await Click.create({
      urlId: data.urlId,
      shortCode: data.shortCode,
      hashedIP: data.hashedIP,
      userAgent: data.userAgent,
      deviceType: data.deviceType,
      browser: data.browser,
      os: data.os,
      referer: data.referer,
      country: data.country,
      city: data.city,
      region: data.region,
    });
  },
};
