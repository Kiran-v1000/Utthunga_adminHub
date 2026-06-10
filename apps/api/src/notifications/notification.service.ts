import { prisma } from '@/config/db';
import type { NotificationPayload } from '@adminhub/shared';
import { emitToUser } from './socket';
import { SOCKET_EVENTS } from '@adminhub/shared';
import { sendEmail } from './mailer';

export async function notifyUser(payload: NotificationPayload) {
  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link,
    },
  });

  // Real-time via socket
  emitToUser(payload.userId, SOCKET_EVENTS.NOTIFICATION_NEW, notification);

  // Email (fire-and-forget)
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { email: true, name: true } });
  if (user) {
    sendEmail({
      to: user.email,
      subject: payload.title,
      html: `<p>Hi ${user.name},</p><p>${payload.body}</p>`,
    }).catch(() => {});
  }

  return notification;
}

export async function getUserNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function markRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
