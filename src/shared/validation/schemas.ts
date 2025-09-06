import { z } from 'zod';
import { FIBONACCI_SEQUENCE, ROOM_CONFIG } from '@shared/constants';

export const createRoomSchema = z.object({
  title: z.string().max(ROOM_CONFIG.MAX_TITLE_LENGTH).optional(),
  maxUsers: z.number().int().min(1).max(50).optional(),
});

export const roomIdSchema = z.object({
  id: z.string().length(ROOM_CONFIG.ID_LENGTH),
});

export const joinRoomSchema = z.object({
  roomId: z.string().length(ROOM_CONFIG.ID_LENGTH),
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(50),
  }),
});

export const voteSchema = z.object({
  roomId: z.string().length(ROOM_CONFIG.ID_LENGTH),
  userId: z.string().min(1),
  vote: z.union([
    z.number().int().nonnegative(),
    z.literal('infinity'),
    z.literal('unknown'),
  ]),
});

export const roomActionSchema = z.object({
  roomId: z.string().length(ROOM_CONFIG.ID_LENGTH),
});

export const leaveRoomSchema = z.object({
  roomId: z.string().length(ROOM_CONFIG.ID_LENGTH),
});

export type CreateRoomRequest = z.infer<typeof createRoomSchema>;
export type RoomIdParams = z.infer<typeof roomIdSchema>;
export type JoinRoomRequest = z.infer<typeof joinRoomSchema>;
export type VoteRequest = z.infer<typeof voteSchema>;
export type RoomActionRequest = z.infer<typeof roomActionSchema>;
export type LeaveRoomRequest = z.infer<typeof leaveRoomSchema>;