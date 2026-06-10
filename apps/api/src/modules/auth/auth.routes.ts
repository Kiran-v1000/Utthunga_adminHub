import { Router } from 'express';
import * as ctrl from './auth.controller';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

router.get('/login', ctrl.login);
router.get('/callback', ctrl.callback);
router.post('/local-login', ctrl.localLogin);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authenticateToken, ctrl.me);

export default router;
