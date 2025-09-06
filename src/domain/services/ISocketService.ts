import { RoomEntity, RoomStats } from '@domain/entities/Room';
import { UserEntity } from '@domain/entities/User';

export interface ISocketService {
  joinUserToRoom(roomId: string, user: UserEntity): void;
  removeUserFromRoom(roomId: string, userId: string): void;
  broadcastRoomState(room: RoomEntity): void;
  broadcastUserJoined(roomId: string, user: UserEntity): void;
  broadcastUserLeft(roomId: string, userId: string): void;
  broadcastVoteCast(roomId: string, userId: string): void;
  broadcastVotesRevealed(roomId: string, stats: RoomStats): void;
  sendError(socketId: string, message: string, code: string): void;
  isUserConnected?(roomId: string, userId: string): boolean;
}