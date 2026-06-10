import { Router } from 'express';
import * as ctrl from './resource.controller';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/rooms', ctrl.rooms);
router.get('/bookings', ctrl.bookings);
router.post('/bookings', ctrl.createBooking);
router.patch('/bookings/:id/cancel', ctrl.cancelBooking);
export default router;
