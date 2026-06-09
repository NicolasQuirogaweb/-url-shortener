import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app';

const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  password: bcrypt.hashSync('password123', 12),
  refreshToken: null,
  createdAt: new Date(),
};

vi.mock('../modules/auth/user.model', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

import { User } from '../modules/auth/user.model';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Auth', () => {
  it('should register a new user', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    vi.mocked(User.create).mockResolvedValue(mockUser as any);

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('should login', async () => {
    vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
    vi.mocked(User.findByIdAndUpdate).mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject invalid password', async () => {
    vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('should refresh token', async () => {
    const refreshToken = jwt.sign(
      { userId: mockUser._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' },
    );
    vi.mocked(User.findById).mockResolvedValue({
      ...mockUser,
      refreshToken,
    } as any);

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject refresh without cookie', async () => {
    const res = await request(app).post('/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('should logout', async () => {
    const accessToken = jwt.sign(
      { userId: mockUser._id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' },
    );

    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
