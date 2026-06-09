import { Redis } from '@upstash/redis';
import { env } from './env';

let redis: Redis;

if (env.NODE_ENV === 'production') {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production');
    process.exit(1);
  }
  redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL ?? 'http://localhost:6379',
    token: env.UPSTASH_REDIS_REST_TOKEN ?? '',
  });
}

export { redis };
