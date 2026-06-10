import { Router } from 'express';
import * as ctrl from './inventory.controller';
import { authenticateToken } from '@/middleware/auth';
import { authorizeRoles } from '@/middleware/rbac';

const router = Router();
router.use(authenticateToken);
const ADMIN = authorizeRoles('SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE');
router.get('/', ADMIN, ctrl.list);
router.get('/alerts/low-stock', ADMIN, ctrl.lowStockAlerts);
router.patch('/:id/stock', ADMIN, ctrl.adjustStock);
export default router;
