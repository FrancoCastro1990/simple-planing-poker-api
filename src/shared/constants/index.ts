export type FibonacciCard = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34 | 55 | 89 | 'infinity' | 'unknown';

export const FIBONACCI_SEQUENCE: FibonacciCard[] = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 'infinity', 'unknown'];

export const ROOM_CONFIG = {
  ID_LENGTH: 6,
  MAX_TITLE_LENGTH: 100,
  DEFAULT_MAX_USERS: 20,
  CLEANUP_TIMEOUT: 5 * 60 * 1000, // 5 minutes
} as const;

export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  USER_ALREADY_VOTED: 'USER_ALREADY_VOTED', 
  INVALID_ROOM_ID: 'INVALID_ROOM_ID',
  INVALID_VOTE: 'INVALID_VOTE',
  NO_VOTES_TO_REVEAL: 'NO_VOTES_TO_REVEAL',
  ROOM_FULL: 'ROOM_FULL',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;