import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import passport from './config/passport';
import { errorHandler } from './shared/middleware/errorHandler';
import { swaggerSpec } from './config/swagger';
import authRoutes from './modules/auth/auth.routes';
import urlRoutes from './modules/urls/url.routes';
import redirectRoutes from './modules/urls/redirect.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

const app = express();

app.use(passport.initialize());

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' }, error: null });
});

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/urls', urlRoutes);
app.use('/urls', analyticsRoutes);
app.use('/', redirectRoutes);

app.use(errorHandler);

export default app;
