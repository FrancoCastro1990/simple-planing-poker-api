import { Server, Socket } from 'socket.io';
import { ISocketService } from '@domain/services/ISocketService';
import { RoomEntity, RoomStats } from '@domain/entities/Room';
import { UserEntity } from '@domain/entities/User';

export class SocketService implements ISocketService {
  private socketUserMap: Map<string, { roomId: string; userId: string }> = new Map();
  private userSocketMap: Map<string, string> = new Map();

  constructor(private io: Server) {}

  registerSocket(socket: Socket, roomId: string, userId: string): void {
    this.socketUserMap.set(socket.id, { roomId, userId });
    this.userSocketMap.set(userId, socket.id);
    socket.join(roomId);
  }

  unregisterSocket(socketId: string): { roomId: string; userId: string } | null {
    const userInfo = this.socketUserMap.get(socketId);
    if (userInfo) {
      this.socketUserMap.delete(socketId);
      this.userSocketMap.delete(userInfo.userId);
      return userInfo;
    }
    return null;
  }

  joinUserToRoom(roomId: string, user: UserEntity): void {
    // Room joining is handled in registerSocket
    // This method can be used for additional logic if needed
  }

  removeUserFromRoom(roomId: string, userId: string): void {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(roomId);
      }
      this.socketUserMap.delete(socketId);
      this.userSocketMap.delete(userId);
    }
  }

  broadcastRoomState(room: RoomEntity): void {
    this.io.to(room.id).emit('room-state-updated', {
      room: room.toJSON(),
    });
  }

  broadcastUserJoined(roomId: string, user: UserEntity): void {
    this.io.to(roomId).emit('user-joined', {
      user: user.toJSON(),
      roomId,
    });
  }

  broadcastUserLeft(roomId: string, userId: string): void {
    this.io.to(roomId).emit('user-left', {
      userId,
      roomId,
    });
  }

  broadcastVoteCast(roomId: string, userId: string): void {
    this.io.to(roomId).emit('vote-cast', {
      userId,
      hasVoted: true,
      roomId,
    });
  }

  broadcastVotesRevealed(roomId: string, stats: RoomStats): void {
    this.io.to(roomId).emit('votes-revealed', {
      roomId,
      results: stats.results,
      average: stats.average,
      totalVotes: stats.totalVotes,
    });
  }

  sendError(socketId: string, message: string, code: string): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('error', {
        message,
        code,
      });
    }
  }

  getRoomIdBySocketId(socketId: string): string | null {
    const userInfo = this.socketUserMap.get(socketId);
    return userInfo ? userInfo.roomId : null;
  }

  getUserIdBySocketId(socketId: string): string | null {
    const userInfo = this.socketUserMap.get(socketId);
    return userInfo ? userInfo.userId : null;
  }
}