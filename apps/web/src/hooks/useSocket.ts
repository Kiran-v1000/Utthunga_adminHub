import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { SOCKET_EVENTS } from '@adminhub/shared';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken, user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!accessToken || !user) return;

    const socket = io('/', {
      auth: { token: accessToken },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (notification) => {
      addNotification(notification);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, user, addNotification]);

  return socketRef.current;
}
