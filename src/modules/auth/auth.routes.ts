/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already registered
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     responses:
 *       200:
 *         description: Token refreshed
 *
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Login with Google
 *     description: Redirects to Google consent screen. Must be opened in browser, not Swagger.
 *     responses:
 *       302:
 *         description: Redirect to Google
 *
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 *     description: Google redirects here after authentication. Returns JWT tokens.
 *     responses:
 *       200:
 *         description: Google login successful
 *       401:
 *         description: Authentication failed
 */

import { Router } from 'express';
import passport from '../../config/passport';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { authenticate } from '../../shared/middleware/authenticate';
import { rateLimitAuth } from '../../shared/middleware/rateLimiter';
import { authController } from './auth.controller';

const router = Router();

router.post('/register', rateLimitAuth, asyncWrapper(authController.register));
router.post('/login', rateLimitAuth, asyncWrapper(authController.login));
router.post('/refresh', asyncWrapper(authController.refresh));
router.post('/logout', authenticate, asyncWrapper(authController.logout));

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
  asyncWrapper(authController.googleCallback),
);

export default router;
