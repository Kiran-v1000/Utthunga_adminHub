import { Router } from 'express';
import * as ctrl from './asset.controller';
import { authenticateToken } from '@/middleware/auth';
import { authorizeRoles } from '@/middleware/rbac';

const router = Router();
router.use(authenticateToken);
const ADMINS = authorizeRoles('SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE','FINANCE_TEAM');
router.get('/', ADMINS, ctrl.list);
router.get('/:id', ADMINS, ctrl.get);
router.post('/', ADMINS, ctrl.create);
router.post('/:id/transfer', ADMINS, ctrl.transfer);
export default router;
