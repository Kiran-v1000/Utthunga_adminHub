import { create } from 'zustand';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  readAt: string | null;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  setNotifications: (items: AppNotification[]) => void;
  addNotification: (item: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (items) =>
    set({ notifications: items, unreadCount: items.filter((n) => !n.readAt).length }),
  addNotification: (item) =>
    set((s) => ({
      notifications: [item, ...s.notifications],
      unreadCount: s.unreadCount + (item.readAt ? 0 : 1),
    })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({
        ...n, readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })),
}));
