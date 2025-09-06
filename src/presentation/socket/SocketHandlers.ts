import { Socket } from 'socket.io';
import { IRoomService } from '@domain/services/IRoomService';
import { ISocketService } from '@domain/services/ISocketService';
import { CreateUserRequest } from '@domain/entities/User';
import { ERROR_CODES } from '@shared/constants';
import { Container } from '@shared/container/Container';

export class SocketHandlers {
  private roomService: IRoomService;
  private socketService: ISocketService;

  constructor() {
    const container = Container.getInstance();
    this.roomService = container.getRoomService();
    this.socketService = container.getSocketService();
  }

  handleConnection = (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-room', this.handleJoinRoom(socket));
    socket.on('leave-room', this.handleLeaveRoom(socket));
    socket.on('vote', this.handleVote(socket));
    socket.on('reveal-votes', this.handleRevealVotes(socket));
    socket.on('reset-votes', this.handleResetVotes(socket));
    socket.on('disconnect', this.handleDisconnect(socket));
  };

  private handleJoinRoom = (socket: Socket) => async (data: any) => {
    try {
      const { roomId, user } = data;
      if (!roomId || !user || !user.id || !user.name) {
        this.socketService.sendError(socket.id, 'Invalid join room data', 'VALIDATION_ERROR');
        return;
      }

      const { room, user: joinedUser } = await this.roomService.joinRoom(roomId, user);
      
      // Register socket with service
      const socketService = this.socketService as any;
      if (socketService.registerSocket) {
        socketService.registerSocket(socket, roomId, user.id);
      }
      
      // Store room ID in socket for cleanup on disconnect
      socket.data.roomId = roomId;
      socket.data.userId = user.id;
      
      // Broadcast room state and user joined
      this.socketService.broadcastRoomState(room);
      this.socketService.broadcastUserJoined(roomId, joinedUser);
      
      console.log(`User ${user.name} joined room ${roomId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
      const errorCode = errorMessage.includes(ERROR_CODES.ROOM_NOT_FOUND) 
        ? ERROR_CODES.ROOM_NOT_FOUND 
        : errorMessage.includes(ERROR_CODES.ROOM_FULL)
        ? ERROR_CODES.ROOM_FULL
        : 'JOIN_ROOM_ERROR';
      
      this.socketService.sendError(socket.id, errorMessage, errorCode);
      console.error('Join room error:', error);
    }
  };

  private handleLeaveRoom = (socket: Socket) => async (data: any) => {
    try {
      const { roomId } = data;
      if (!roomId) {
        this.socketService.sendError(socket.id, 'Invalid leave room data', 'VALIDATION_ERROR');
        return;
      }

      const userId = socket.data.userId;

      if (!userId) {
        return;
      }

      const room = await this.roomService.leaveRoom(roomId, userId);
      
      this.socketService.removeUserFromRoom(roomId, userId);
      
      if (room) {
        this.socketService.broadcastRoomState(room);
        this.socketService.broadcastUserLeft(roomId, userId);
      }
      
      // Clear socket data
      socket.data.roomId = undefined;
      socket.data.userId = undefined;
      
      console.log(`User ${userId} left room ${roomId}`);
    } catch (error) {
      console.error('Leave room error:', error);
    }
  };

  private handleVote = (socket: Socket) => async (data: any) => {
    try {
      const { roomId, userId, vote } = data;
      if (!roomId || !userId || vote === undefined) {
        this.socketService.sendError(socket.id, 'Invalid vote data', 'VALIDATION_ERROR');
        return;
      }

      // Verify user is in the room
      if (socket.data.roomId !== roomId || socket.data.userId !== userId) {
        this.socketService.sendError(socket.id, 'Unauthorized vote attempt', 'UNAUTHORIZED');
        return;
      }

      const room = await this.roomService.castVote(roomId, userId, vote);
      
      this.socketService.broadcastRoomState(room);
      this.socketService.broadcastVoteCast(roomId, userId);
      
      console.log(`User ${userId} voted in room ${roomId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote';
      const errorCode = errorMessage.includes(ERROR_CODES.USER_ALREADY_VOTED) 
        ? ERROR_CODES.USER_ALREADY_VOTED 
        : 'VOTE_ERROR';
      
      this.socketService.sendError(socket.id, errorMessage, errorCode);
      console.error('Vote error:', error);
    }
  };

  private handleRevealVotes = (socket: Socket) => async (data: any) => {
    try {
      const { roomId } = data;
      if (!roomId) {
        this.socketService.sendError(socket.id, 'Invalid reveal votes data', 'VALIDATION_ERROR');
        return;
      }

      // Verify user is in the room
      if (socket.data.roomId !== roomId) {
        this.socketService.sendError(socket.id, 'Unauthorized reveal attempt', 'UNAUTHORIZED');
        return;
      }

      const { room, stats } = await this.roomService.revealVotes(roomId);
      
      this.socketService.broadcastRoomState(room);
      this.socketService.broadcastVotesRevealed(roomId, stats);
      
      console.log(`Votes revealed in room ${roomId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reveal votes';
      const errorCode = errorMessage.includes(ERROR_CODES.NO_VOTES_TO_REVEAL) 
        ? ERROR_CODES.NO_VOTES_TO_REVEAL 
        : 'REVEAL_ERROR';
      
      this.socketService.sendError(socket.id, errorMessage, errorCode);
      console.error('Reveal votes error:', error);
    }
  };

  private handleResetVotes = (socket: Socket) => async (data: any) => {
    try {
      const { roomId } = data;
      if (!roomId) {
        this.socketService.sendError(socket.id, 'Invalid reset votes data', 'VALIDATION_ERROR');
        return;
      }

      // Verify user is in the room
      if (socket.data.roomId !== roomId) {
        this.socketService.sendError(socket.id, 'Unauthorized reset attempt', 'UNAUTHORIZED');
        return;
      }

      const room = await this.roomService.resetVotes(roomId);
      
      this.socketService.broadcastRoomState(room);
      
      console.log(`Votes reset in room ${roomId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset votes';
      this.socketService.sendError(socket.id, errorMessage, 'RESET_ERROR');
      console.error('Reset votes error:', error);
    }
  };

  private handleDisconnect = (socket: Socket) => async () => {
    try {
      const roomId = socket.data.roomId;
      const userId = socket.data.userId;
      
      // Always unregister the socket immediately
      const socketService = this.socketService as any;
      if (socketService.unregisterSocket) {
        socketService.unregisterSocket(socket.id);
      }
      
      if (roomId && userId) {
        // Don't immediately remove user from room - they might be reconnecting (page reload)
        // Instead, mark them as disconnected and set a timeout to remove them if they don't reconnect
        console.log(`User ${userId} disconnected from room ${roomId} - waiting for potential reconnection`);
        
        // Set a timeout to remove the user if they don't reconnect within 30 seconds
        setTimeout(async () => {
          try {
            // Check if user has reconnected by checking if there's an active socket for this user
            const isUserConnected = socketService.isUserConnected && socketService.isUserConnected(roomId, userId);
            
            if (!isUserConnected) {
              console.log(`User ${userId} did not reconnect - removing from room ${roomId}`);
              const room = await this.roomService.leaveRoom(roomId, userId);
              
              if (room) {
                this.socketService.broadcastRoomState(room);
                this.socketService.broadcastUserLeft(roomId, userId);
              }
            } else {
              console.log(`User ${userId} successfully reconnected to room ${roomId}`);
            }
          } catch (error) {
            console.error('Error in delayed user removal:', error);
          }
        }, 5000); // 5 seconds timeout - reasonable for page reloads
      }
      
      console.log(`Client disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };
}