import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Allow streaming media & preview
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

export const corsMiddleware = cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Admin-Key', 'X-File-Size', 'X-File-Name'],
});
