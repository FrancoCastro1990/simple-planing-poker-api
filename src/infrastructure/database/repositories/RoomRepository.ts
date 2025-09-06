import { Pool } from 'pg';
import { IRoomRepository } from '@domain/repositories/IRoomRepository';
import { RoomEntity, CreateRoomRequest } from '@domain/entities/Room';
import { ERROR_CODES } from '@shared/constants';

export class RoomRepository implements IRoomRepository {
  constructor(private db: Pool) {}

  async create(id: string, data: CreateRoomRequest): Promise<RoomEntity> {
    try {
      const query = `
        INSERT INTO rooms (id, title, max_users, total_score, created_at, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const room = new RoomEntity(id, data);
      const values = [
        room.id,
        room.title || null,
        room.maxUsers,
        room.totalScore,
      ];

      await this.db.query(query, values);
      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error(ERROR_CODES.DATABASE_ERROR);
    }
  }

  async findById(id: string): Promise<RoomEntity | null> {
    try {
      const query = 'SELECT * FROM rooms WHERE id = $1';
      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const room = new RoomEntity(row.id, {
        title: row.title,
        maxUsers: row.max_users,
      });

      room.totalScore = parseFloat(row.total_score) || 0;
      
      return room;
    } catch (error) {
      console.error('Error finding room:', error);
      throw new Error(ERROR_CODES.DATABASE_ERROR);
    }
  }

  async update(room: RoomEntity): Promise<void> {
    try {
      const query = `
        UPDATE rooms 
        SET total_score = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `;
      
      await this.db.query(query, [room.totalScore, room.id]);
    } catch (error) {
      console.error('Error updating room:', error);
      throw new Error(ERROR_CODES.DATABASE_ERROR);
    }
  }

  // Room deletion disabled - rooms are kept permanently
  async delete(id: string): Promise<boolean> {
    // Rooms are never deleted from database
    console.log(`Room deletion attempted for ${id} - operation disabled`);
    return false;
  }

  async findEmptyRooms(olderThan: Date): Promise<string[]> {
    try {
      const query = `
        SELECT id FROM rooms 
        WHERE updated_at < $1
      `;
      
      const result = await this.db.query(query, [olderThan]);
      return result.rows.map(row => row.id);
    } catch (error) {
      console.error('Error finding empty rooms:', error);
      throw new Error(ERROR_CODES.DATABASE_ERROR);
    }
  }

  async updateTotalScore(roomId: string, totalScore: number): Promise<void> {
    try {
      const query = `
        UPDATE rooms 
        SET total_score = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `;
      
      await this.db.query(query, [totalScore, roomId]);
    } catch (error) {
      console.error('Error updating room total score:', error);
      throw new Error(ERROR_CODES.DATABASE_ERROR);
    }
  }
}