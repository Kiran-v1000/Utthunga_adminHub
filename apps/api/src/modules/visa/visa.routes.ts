import { Router } from 'express';
import * as ctrl from './visa.controller';
import { authenticateToken } from '@/middleware/auth';
import { authorizeRoles } from '@/middleware/rbac';

const router = Router();
router.use(authenticateToken);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', authorizeRoles('SUPER_ADMIN','FACILITY_MANAGER','ADMIN_EXECUTIVE','HR_TEAM'), ctrl.create);

export default router;
