import { Router } from 'express';
import { validateHmac } from './webhook.validator';
import { prisma } from '@/config/db';
import { createForEmployee, handleExit } from '@/modules/idcard/idcard.service';
import { notifyUser } from '@/notifications/notification.service';

const router = Router();

function requireHmac(req: Parameters<typeof validateHmac>[0], res: { status: (n: number) => { json: (o: unknown) => void } }, next: () => void) {
  if (!validateHmac(req, process.env.HRMS_WEBHOOK_SECRET!)) {
    return res.status(401).json({ success: false, error: 'Invalid HMAC signature' });
  }
  next();
}

// POST /integrations/hrms/employee-created
router.post('/employee-created', requireHmac as never, async (req, res) => {
  const { employeeId, email, name, officeLocation, role, employeeType, buId } = req.body;

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email, name,
        employeeId: employeeId ?? undefined,
        role: role ?? 'EMPLOYEE',
        officeLocation: officeLocation ?? 'BANGALORE',
        buId: buId ?? undefined,
      },
    });
  }

  await createForEmployee(user.id, employeeType ?? 'FULL_TIME');

  const admins = await prisma.user.findMany({
    where: { role: { in: ['HR_TEAM', 'ADMIN_EXECUTIVE', 'SUPER_ADMIN'] } },
    select: { id: true },
  });
  for (const admin of admins) {
    await notifyUser({
      userId: admin.id, type: 'ID_CARD_PENDING',
      title: 'New ID card required',
      body: `${name} has joined. Please generate their ID card.`,
      link: '/idcards',
    });
  }

  res.json({ success: true, data: { userId: user.id } });
});

// POST /integrations/hrms/employee-exit
router.post('/employee-exit', requireHmac as never, async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const exitRecord = await handleExit(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });

  res.json({ success: true, data: exitRecord });
});

export default router;
