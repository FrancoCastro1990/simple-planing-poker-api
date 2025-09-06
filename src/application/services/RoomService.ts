import { nanoid } from 'nanoid';
import { IRoomService } from '@domain/services/IRoomService';
import { IRoomRepository } from '@domain/repositories/IRoomRepository';
import { RoomEntity, CreateRoomRequest, RoomStats } from '@domain/entities/Room';
import { UserEntity, CreateUserRequest } from '@domain/entities/User';
import { FibonacciCard, ROOM_CONFIG, ERROR_CODES, FIBONACCI_SEQUENCE } from '@shared/constants';

export class RoomService implements IRoomService {
  private rooms: Map<string, RoomEntity> = new Map();

  constructor(private roomRepository: IRoomRepository) {}

  async createRoom(data: CreateRoomRequest = {}): Promise<RoomEntity> {
    const roomId = nanoid(ROOM_CONFIG.ID_LENGTH);
    
    const room = await this.roomRepository.create(roomId, data);
    this.rooms.set(roomId, room);
    
    return room;
  }

  async getRoomById(id: string): Promise<RoomEntity | null> {
    // First check in-memory cache
    let room = this.rooms.get(id);
    
    if (!room) {
      // If not in cache, try to load from database
      const dbRoom = await this.roomRepository.findById(id);
      if (dbRoom) {
        this.rooms.set(id, dbRoom);
        room = dbRoom;
      }
    }
    
    return room || null;
  }

  async joinRoom(roomId: string, userData: CreateUserRequest): Promise<{ room: RoomEntity; user: UserEntity }> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error(ERROR_CODES.ROOM_NOT_FOUND);
    }

    // Check if user already exists in room
    let user = room.getUser(userData.id);
    
    if (user) {
      // User is rejoining (e.g., after page reload) - keep existing state
      // Just update the name in case it changed
      if (user.name !== userData.name) {
        user.updateName(userData.name);
      }
    } else {
      // New user joining
      user = new UserEntity(userData);
      const success = room.addUser(user);
      
      if (!success) {
        throw new Error(ERROR_CODES.ROOM_FULL);
      }
    }

    return { room, user };
  }

  async leaveRoom(roomId: string, userId: string): Promise<RoomEntity | null> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      return null;
    }

    room.removeUser(userId);

    // Room is kept alive permanently - never deleted
    return room;
  }

  async castVote(roomId: string, userId: string, vote: FibonacciCard): Promise<RoomEntity> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error(ERROR_CODES.ROOM_NOT_FOUND);
    }

    if (!FIBONACCI_SEQUENCE.includes(vote)) {
      throw new Error(ERROR_CODES.INVALID_VOTE);
    }

    const user = room.getUser(userId);
    if (!user) {
      throw new Error('User not found in room');
    }

    // Allow vote changes before votes are revealed (standard Planning Poker behavior)
    // Only prevent voting if votes have already been revealed
    if (room.isRevealed) {
      throw new Error('Cannot vote after results have been revealed');
    }

    room.castVote(userId, vote);
    return room;
  }

  async revealVotes(roomId: string): Promise<{ room: RoomEntity; stats: RoomStats }> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error(ERROR_CODES.ROOM_NOT_FOUND);
    }

    const stats = room.revealVotes();
    if (!stats) {
      throw new Error(ERROR_CODES.NO_VOTES_TO_REVEAL);
    }

    // Update room in database with new total score
    await this.roomRepository.updateTotalScore(roomId, room.totalScore);

    return { room, stats };
  }

  async resetVotes(roomId: string): Promise<RoomEntity> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error(ERROR_CODES.ROOM_NOT_FOUND);
    }

    room.resetVotes();
    return room;
  }

  // Room cleanup disabled - rooms are kept permanently
  async cleanupEmptyRooms(): Promise<number> {
    // No cleanup performed - all rooms are persistent
    return 0;
  }

  // Additional utility methods
  getRoomCount(): number {
    return this.rooms.size;
  }

  getAllRoomIds(): string[] {
    return Array.from(this.rooms.keys());
  }
}