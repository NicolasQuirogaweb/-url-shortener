/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUrlInput:
 *       type: object
 *       required: [originalUrl]
 *       properties:
 *         originalUrl:
 *           type: string
 *           format: uri
 *         customSlug:
 *           type: string
 *           pattern: '^[a-zA-Z0-9_-]{4,16}$'
 *         expiresAt:
 *           type: string
 *           format: date-time
 *     UrlResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         originalUrl:
 *           type: string
 *         shortCode:
 *           type: string
 *         shortUrl:
 *           type: string
 *         clicks:
 *           type: integer
 *         expiresAt:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *
 * /urls:
 *   post:
 *     tags: [URLs]
 *     summary: Create a short URL
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUrlInput'
 *     responses:
 *       201:
 *         description: Short URL created
 *   get:
 *     tags: [URLs]
 *     summary: List user URLs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of URLs
 *
 * /urls/{id}:
 *   get:
 *     tags: [URLs]
 *     summary: Get URL by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL details
 *       404:
 *         description: URL not found
 *   delete:
 *     tags: [URLs]
 *     summary: Soft delete a URL
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL deleted
 *       404:
 *         description: URL not found
 */

import { Router } from 'express';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { authenticate } from '../../shared/middleware/authenticate';
import { urlController } from './url.controller';

const router = Router();

router.use(authenticate);

router.post('/', asyncWrapper(urlController.create));
router.get('/', asyncWrapper(urlController.list));
router.get('/:id', asyncWrapper(urlController.getById));
router.delete('/:id', asyncWrapper(urlController.delete));

export default router;
