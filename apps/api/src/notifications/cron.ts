import cron from 'node-cron';
import { getExpiryAlertCandidates } from '@/modules/visa/visa.service';
import { checkSlaBreaches } from '@/modules/grievance/grievance.service';
import { prisma } from '@/config/db';
import { notifyUser } from './notification.service';
import { sendEmail } from './mailer';

export function initCronJobs() {
  // Visa expiry alerts — daily at 9am
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running visa expiry check');
    const candidates = await getExpiryAlertCandidates().catch(() => []);
    for (const { visa, days, alertType } of candidates) {
      await notifyUser({
        userId: visa.userId,
        type: 'VISA_EXPIRY',
        title: `Visa expiring in ${days} days`,
        body: `Your ${visa.visaType} visa for ${visa.country} expires on ${visa.expiryDate.toDateString()}.`,
        link: `/visa/${visa.id}`,
      });
      await prisma.visaAlert.create({
        data: { visaRecordId: visa.id, alertType, sentAt: new Date() },
      }).catch(() => {});
    }
  });

  // Inventory reorder alerts — daily at 10am
  cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Running inventory reorder check');
    const lowStock = await prisma.inventoryItem.findMany({
      where: { isActive: true },
      select: { id: true, name: true, quantity: true, reorderLevel: true },
    }).catch(() => []);

    const alerts = lowStock.filter((i) => i.quantity <= i.reorderLevel);
    for (const item of alerts) {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'FACILITY_MANAGER', 'ADMIN_EXECUTIVE'] } },
        select: { id: true },
      });
      for (const admin of admins) {
        await notifyUser({
          userId: admin.id, type: 'INVENTORY_LOW',
          title: 'Low stock alert',
          body: `${item.name} is running low (${item.quantity} remaining, reorder at ${item.reorderLevel}).`,
          link: '/inventory',
        });
      }
    }
  });

  // SLA breach check — every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Checking grievance SLA breaches');
    const breached = await checkSlaBreaches().catch(() => []);
    for (const ticket of breached) {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'FACILITY_MANAGER', 'ADMIN_EXECUTIVE'] } },
        select: { id: true },
      });
      for (const admin of admins) {
        await notifyUser({
          userId: admin.id, type: 'SLA_BREACH',
          title: 'Grievance SLA breached',
          body: `A ticket has exceeded its SLA deadline.`,
          link: `/grievances/${ticket.id}`,
        });
      }
    }
  });

  console.log('✅ Cron jobs initialized');
}
