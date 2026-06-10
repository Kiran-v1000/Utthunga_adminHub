import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { getUserNotifications, markRead, markAllRead } from '@/notifications/notification.service';
import { ok } from '@/shared/pagination';
import { z } from 'zod';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  const { page, limit } = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
  }).parse(req.query);
  const result = await getUserNotifications(req.user!.userId, page, limit);
  res.json(ok(result.data, result.meta));
});

router.patch('/:id/read', async (req, res) => {
  await markRead(req.params.id, req.user!.userId);
  res.json(ok(null));
});

router.patch('/read-all', async (req, res) => {
  await markAllRead(req.user!.userId);
  res.json(ok(null));
});

export default router;
