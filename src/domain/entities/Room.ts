import { UserEntity, User } from './User';
import { FibonacciCard, ROOM_CONFIG } from '@shared/constants';

export interface VoteResult {
  userId: string;
  userName: string;
  vote: FibonacciCard;
  isHighest: boolean;
  isLowest: boolean;
}

export interface RoomStats {
  totalVotes: number;
  average: number;
  validVotes: FibonacciCard[];
  results: VoteResult[];
}

export interface Room {
  id: string;
  title?: string;
  users: User[];
  votes: Record<string, FibonacciCard>;
  isRevealed: boolean;
  createdAt: Date;
  maxUsers: number;
  totalScore: number;
}

export interface CreateRoomRequest {
  title?: string;
  maxUsers?: number;
}

export class RoomEntity {
  public readonly id: string;
  public readonly title?: string;
  public readonly maxUsers: number;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public totalScore: number = 0;
  private users: Map<string, UserEntity> = new Map();
  private votes: Map<string, FibonacciCard> = new Map();
  public isRevealed: boolean = false;

  constructor(id: string, data: CreateRoomRequest = {}) {
    this.id = id;
    this.title = data.title;
    this.maxUsers = data.maxUsers || ROOM_CONFIG.DEFAULT_MAX_USERS;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addUser(user: UserEntity): boolean {
    if (this.users.size >= this.maxUsers) {
      return false;
    }

    if (this.users.has(user.id)) {
      return true; // User already in room
    }

    this.users.set(user.id, user);
    this.updatedAt = new Date();
    return true;
  }

  removeUser(userId: string): boolean {
    const removed = this.users.delete(userId);
    if (removed) {
      this.votes.delete(userId);
      this.updatedAt = new Date();
    }
    return removed;
  }

  getUser(userId: string): UserEntity | undefined {
    return this.users.get(userId);
  }

  getUserCount(): number {
    return this.users.size;
  }

  castVote(userId: string, vote: FibonacciCard): boolean {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    user.castVote(vote);
    this.votes.set(userId, vote);
    this.updatedAt = new Date();
    return true;
  }

  revealVotes(): RoomStats | null {
    if (this.votes.size === 0) {
      return null;
    }

    this.isRevealed = true;
    this.updatedAt = new Date();

    const validVotes: FibonacciCard[] = [];
    const numericVotes: number[] = [];
    const results: VoteResult[] = [];

    // Process votes
    this.votes.forEach((vote, userId) => {
      const user = this.users.get(userId);
      if (!user) return;

      validVotes.push(vote);
      results.push({
        userId,
        userName: user.name,
        vote,
        isHighest: false,
        isLowest: false,
      });

      // Convert to numeric for average calculation
      if (typeof vote === 'number') {
        numericVotes.push(vote);
      } else if (vote === 'infinity') {
        numericVotes.push(100); // Treat infinity as 100 for calculation
      }
      // Skip 'unknown' votes in average calculation
    });

    // Calculate average
    const average = numericVotes.length > 0 
      ? numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length 
      : 0;

    // Mark highest and lowest (only for numeric votes)
    if (numericVotes.length > 1) {
      const maxVote = Math.max(...numericVotes);
      const minVote = Math.min(...numericVotes);

      results.forEach(result => {
        const numericValue = typeof result.vote === 'number' ? result.vote : 
                           result.vote === 'infinity' ? 100 : null;
        
        if (numericValue !== null) {
          result.isHighest = numericValue === maxVote;
          result.isLowest = numericValue === minVote;
        }
      });
    }

    // Update total score
    this.totalScore = average;

    return {
      totalVotes: this.votes.size,
      average,
      validVotes,
      results,
    };
  }

  resetVotes(): void {
    this.votes.clear();
    this.isRevealed = false;
    this.users.forEach(user => user.clearVote());
    this.updatedAt = new Date();
  }

  isEmpty(): boolean {
    return this.users.size === 0;
  }

  toJSON(): Room {
    return {
      id: this.id,
      title: this.title,
      users: Array.from(this.users.values()).map(user => user.toJSON()),
      votes: Object.fromEntries(this.votes),
      isRevealed: this.isRevealed,
      createdAt: this.createdAt,
      maxUsers: this.maxUsers,
      totalScore: this.totalScore,
    };
  }
}