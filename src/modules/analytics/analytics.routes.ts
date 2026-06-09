/**
 * @swagger
 * /urls/{id}/analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Get click analytics for a URL
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *     responses:
 *       200:
 *         description: Analytics data
 *       404:
 *         description: URL not found
 */

import { Router } from 'express';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { authenticate } from '../../shared/middleware/authenticate';
import { analyticsController } from './analytics.controller';

const router = Router();

router.get('/:id/analytics', authenticate, asyncWrapper(analyticsController.getAnalytics));

export default router;
