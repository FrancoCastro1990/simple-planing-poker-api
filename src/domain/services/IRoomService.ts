import { RoomEntity, CreateRoomRequest, RoomStats } from '@domain/entities/Room';
import { UserEntity, CreateUserRequest } from '@domain/entities/User';
import { FibonacciCard } from '@shared/constants';

export interface IRoomService {
  createRoom(data: CreateRoomRequest): Promise<RoomEntity>;
  getRoomById(id: string): Promise<RoomEntity | null>;
  joinRoom(roomId: string, userData: CreateUserRequest): Promise<{ room: RoomEntity; user: UserEntity }>;
  leaveRoom(roomId: string, userId: string): Promise<RoomEntity | null>;
  castVote(roomId: string, userId: string, vote: FibonacciCard): Promise<RoomEntity>;
  revealVotes(roomId: string): Promise<{ room: RoomEntity; stats: RoomStats }>;
  resetVotes(roomId: string): Promise<RoomEntity>;
  cleanupEmptyRooms(): Promise<number>;
}