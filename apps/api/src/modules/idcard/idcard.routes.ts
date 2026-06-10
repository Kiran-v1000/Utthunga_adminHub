import { Router } from 'express';
import * as ctrl from './idcard.controller';
import { authenticateToken } from '@/middleware/auth';
import { authorizeRoles } from '@/middleware/rbac';

const router = Router();
router.use(authenticateToken);
const ADMIN_HR = authorizeRoles('SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE','HR_TEAM');
router.get('/', ADMIN_HR, ctrl.list);
router.get('/:id', ADMIN_HR, ctrl.get);
router.patch('/:id/status', ADMIN_HR, ctrl.updateStatus);
export default router;
