import { Request, Response } from 'express';
import { Container } from '@shared/container/Container';
import { IRoomService } from '@domain/services/IRoomService';
import { formatError } from '@shared/utils';
import { ERROR_CODES } from '@shared/constants';

export class RoomController {
  private get roomService(): IRoomService {
    return Container.getInstance().getRoomService();
  }

  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const { title, maxUsers } = req.body;
      
      const room = await this.roomService.createRoom({
        title,
        maxUsers,
      });

      res.status(201).json({
        success: true,
        data: {
          id: room.id,
          room: room.toJSON(),
        },
      });
    } catch (error) {
      console.error('Error creating room:', error);
      const { message, code } = formatError(error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create room',
          code: code || ERROR_CODES.DATABASE_ERROR,
        },
      });
    }
  }

  async getRoomById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const room = await this.roomService.getRoomById(id);

      if (!room) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Room not found',
            code: ERROR_CODES.ROOM_NOT_FOUND,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          room: room.toJSON(),
        },
      });
    } catch (error) {
      console.error('Error getting room:', error);
      const { message, code } = formatError(error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get room',
          code: code || ERROR_CODES.DATABASE_ERROR,
        },
      });
    }
  }

  async getRoomStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const room = await this.roomService.getRoomById(id);

      if (!room) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Room not found',
            code: ERROR_CODES.ROOM_NOT_FOUND,
          },
        });
        return;
      }

      // Calculate basic stats
      const users = Array.from(room.toJSON().users);
      const totalUsers = users.length;
      const usersWhoVoted = users.filter(user => user.hasVoted).length;
      const votingProgress = totalUsers > 0 ? (usersWhoVoted / totalUsers) * 100 : 0;

      res.status(200).json({
        success: true,
        data: {
          roomId: room.id,
          title: room.title,
          totalUsers,
          usersWhoVoted,
          votingProgress: Math.round(votingProgress),
          isRevealed: room.isRevealed,
          totalScore: room.totalScore,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error getting room stats:', error);
      const { message, code } = formatError(error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get room stats',
          code: code || ERROR_CODES.DATABASE_ERROR,
        },
      });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  }
}