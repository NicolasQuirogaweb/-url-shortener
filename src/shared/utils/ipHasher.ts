import { createHash } from 'crypto';

export const hashIP = (ip: string): string => {
  return createHash('sha256').update(ip).digest('hex');
};
