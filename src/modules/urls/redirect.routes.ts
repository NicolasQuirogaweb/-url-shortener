/**
 * @swagger
 * /{shortCode}:
 *   get:
 *     tags: [Redirect]
 *     summary: Redirect to original URL
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to original URL
 *       404:
 *         description: URL not found
 *       410:
 *         description: URL expired
 */

import { Router } from 'express';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { rateLimitRedirect } from '../../shared/middleware/rateLimiter';
import { redirectController } from './redirect.controller';

const router = Router();

router.get('/:shortCode', rateLimitRedirect, asyncWrapper(redirectController.redirect));

export default router;
