import { Router } from 'express';
import * as ctrl from './visitor.controller';
import { authenticateToken } from '@/middleware/auth';
import { authorizeRoles } from '@/middleware/rbac';

const router = Router();
router.use(authenticateToken);

router.get('/', ctrl.list);
router.get('/stats/today', ctrl.todayStats);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.patch('/:id/status',
  authorizeRoles('SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE','RECEPTIONIST'),
  ctrl.updateStatus,
);

export default router;
