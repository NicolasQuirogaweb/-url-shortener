import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

const userId = '507f1f77bcf86cd799439011';

const mockUrls = [
  {
    _id: '507f1f77bcf86cd799439012',
    id: '507f1f77bcf86cd799439012',
    originalUrl: 'https://example.com',
    shortCode: 'abc12345',
    shortUrl: 'http://localhost:3000/abc12345',
    userId,
    clicks: 0,
    expiresAt: null,
    createdAt: new Date(),
    deletedAt: null,
  },
];

vi.mock('../modules/urls/url.model', () => ({
  Url: {
    findOne: vi.fn(),
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
  },
}));

vi.mock('../modules/analytics/click.model', () => ({
  Click: {
    create: vi.fn(),
    aggregate: vi.fn(),
  },
}));

import { Url } from '../modules/urls/url.model';

const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('URLs', () => {
  it('should create a short URL', async () => {
    vi.mocked(Url.findOne).mockResolvedValue(null);
    vi.mocked(Url.create).mockResolvedValue(mockUrls[0] as any);

    const res = await request(app)
      .post('/urls')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ originalUrl: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body.data.shortCode).toBe('abc12345');
  });

  it('should reject duplicate custom slug', async () => {
    vi.mocked(Url.findOne).mockResolvedValue(mockUrls[0] as any);

    const res = await request(app)
      .post('/urls')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ originalUrl: 'https://example.com', customSlug: 'abc12345' });

    expect(res.status).toBe(409);
  });

  it('should list user URLs', async () => {
    vi.mocked(Url.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        skip: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(mockUrls),
        }),
      }),
    } as any);
    vi.mocked(Url.countDocuments).mockResolvedValue(1);

    const res = await request(app)
      .get('/urls')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should soft delete a URL', async () => {
    vi.mocked(Url.findOne).mockResolvedValue(mockUrls[0] as any);
    vi.mocked(Url.findOneAndUpdate).mockResolvedValue(mockUrls[0] as any);

    const res = await request(app)
      .delete('/urls/507f1f77bcf86cd799439012')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).post('/urls').send({ originalUrl: 'https://example.com' });
    expect(res.status).toBe(401);
  });
});
