import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '@adminhub/shared';

let io: Server;
const userSockets = new Map<string, Set<string>>();

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string;
      if (!token) throw new Error('No token');
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId: string = socket.data.userId;
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId)!.add(socket.id);

    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      userSockets.get(userId)?.delete(socket.id);
      if (!userSockets.get(userId)?.size) userSockets.delete(userId);
    });
  });

  return io;
}

export function emitToUser(userId: string, event: string, data: unknown) {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitEvent(event: string, data: unknown) {
  io?.emit(event, data);
}
