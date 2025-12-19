import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import { Types } from 'mongoose';

interface SocketUser {
  userId: Types.ObjectId;
  socketId: string;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private users: Map<string, SocketUser> = new Map();

  initialize(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
      }
    });

    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = verifyToken(token);
        (socket as any).user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      const user = (socket as any).user;
      
      // Store user connection
      this.users.set(socket.id, {
        userId: user.userId,
        socketId: socket.id
      });

      console.log(`User connected: ${user.userId}`);

      // Join user to their personal room
      socket.join(`user:${user.userId}`);

      // Handle disconnection
      socket.on('disconnect', () => {
        this.users.delete(socket.id);
        console.log(`User disconnected: ${user.userId}`);
      });

      // Handle task updates
      socket.on('task:update', (data) => {
        // Broadcast to all users except sender
        socket.broadcast.emit('task:updated', data);
      });

      // Handle task creation
      socket.on('task:create', (data) => {
        socket.broadcast.emit('task:created', data);
      });

      // Handle task deletion
      socket.on('task:delete', (data) => {
        socket.broadcast.emit('task:deleted', data);
      });
    });

    console.log('✅ Socket.IO initialized');
  }

  // Get io instance
  getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.IO not initialized');
    }
    return this.io;
  }

  // Get user socket by userId
  getUserSocket(userId: Types.ObjectId): string | undefined {
    for (const [socketId, user] of this.users) {
      if (user.userId.toString() === userId.toString()) {
        return socketId;
      }
    }
    return undefined;
  }

  // Send notification to specific user
  sendNotification(userId: Types.ObjectId, event: string, data: any) {
    const socketId = this.getUserSocket(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Broadcast to all users
  broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const socketService = new SocketService();
export const io = socketService.getIO();