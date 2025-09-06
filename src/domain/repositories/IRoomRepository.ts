import { RoomEntity, CreateRoomRequest } from '@domain/entities/Room';

export interface IRoomRepository {
  create(id: string, data: CreateRoomRequest): Promise<RoomEntity>;
  findById(id: string): Promise<RoomEntity | null>;
  update(room: RoomEntity): Promise<void>;
  delete(id: string): Promise<boolean>;
  findEmptyRooms(olderThan: Date): Promise<string[]>;
  updateTotalScore(roomId: string, totalScore: number): Promise<void>;
}