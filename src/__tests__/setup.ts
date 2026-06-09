import { vi } from 'vitest';

vi.mock('../config/redis', () => ({
  redis: {
    pipeline: vi.fn(() => ({
      set: vi.fn(),
      get: vi.fn(),
      exec: vi.fn().mockResolvedValue([]),
    })),
    set: vi.fn(),
    get: vi.fn(),
    srem: vi.fn(),
    lrange: vi.fn(),
  },
}));

vi.mock('@upstash/ratelimit', () => {
  const Ratelimit = vi.fn(() => ({
    limit: vi.fn().mockResolvedValue({ success: true }),
  }));
  return {
    Ratelimit: Object.assign(Ratelimit, {
      slidingWindow: vi.fn(() => ({})),
    }),
  };
});
