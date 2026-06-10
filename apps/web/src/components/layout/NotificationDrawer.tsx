import React from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';

export function NotificationDrawer() {
  const [open, setOpen] = React.useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();
  const navigate = useNavigate();

  const handleOpen = () => setOpen(true);

  const handleClick = async (id: string, link?: string) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    markRead(id);
    if (link) { navigate(link); setOpen(false); }
  };

  const handleMarkAll = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    markAllRead();
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-text-2 hover:text-text-1 hover:bg-surface transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="flex w-96 flex-col bg-card border-l border-border shadow-modal animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-subhead text-text-1">Notifications</h2>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAll}>
                  <Check className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-text-2">
                  <Bell className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-body">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n.id, n.link)}
                    className={cn(
                      'w-full text-left px-5 py-4 border-b border-border hover:bg-surface transition-colors',
                      !n.readAt && 'bg-primary-50/40',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {!n.readAt && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                      <div className={cn('flex-1', n.readAt && 'ml-5')}>
                        <p className="text-body font-medium text-text-1">{n.title}</p>
                        <p className="text-caption text-text-2 mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-caption text-text-2/60 mt-1">{formatDateTime(n.createdAt)}</p>
                      </div>
                      {n.link && <ExternalLink className="h-3.5 w-3.5 text-text-2/40 shrink-0 mt-1" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
