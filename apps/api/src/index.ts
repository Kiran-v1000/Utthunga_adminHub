import path from 'path';
import dotenv from 'dotenv';
// Load .env from monorepo root (two levels up from apps/api/src)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import 'express-async-errors';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { initSocket } from './notifications/socket';
import { initCronJobs } from './notifications/cron';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import visitorRoutes from './modules/visitor/visitor.routes';
import travelRoutes from './modules/travel/travel.routes';
import visaRoutes from './modules/visa/visa.routes';
import shipmentRoutes from './modules/shipment/shipment.routes';
import grievanceRoutes from './modules/grievance/grievance.routes';
import resourceRoutes from './modules/resource/resource.routes';
import assetRoutes from './modules/asset/asset.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import idcardRoutes from './modules/idcard/idcard.routes';
import notificationRoutes from './modules/notification/notification.routes';
import reportRoutes from './modules/reports/reports.routes';
import hrmsRoutes from './integrations/hrms.handler';
import erpRoutes from './integrations/erp.handler';

const app = express();
const server = http.createServer(app);

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(rateLimiter);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Routes
const API = '/api';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/visitors`, visitorRoutes);
app.use(`${API}/travel`, travelRoutes);
app.use(`${API}/visa`, visaRoutes);
app.use(`${API}/shipments`, shipmentRoutes);
app.use(`${API}/grievances`, grievanceRoutes);
app.use(`${API}/resources`, resourceRoutes);
app.use(`${API}/assets`, assetRoutes);
app.use(`${API}/inventory`, inventoryRoutes);
app.use(`${API}/idcards`, idcardRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/integrations/hrms`, hrmsRoutes);
app.use(`${API}/integrations/erp`, erpRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

// Socket.io
initSocket(server);

// Cron jobs
if (process.env.NODE_ENV !== 'test') {
  initCronJobs();
}

const PORT = parseInt(process.env.PORT || '4000', 10);
server.listen(PORT, () => {
  console.log(`🚀 Utthunga AdminHub API running on port ${PORT}`);
});

export default app;
