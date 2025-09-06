import { FibonacciCard } from '@shared/constants';

export interface User {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: FibonacciCard;
}

export interface CreateUserRequest {
  id: string;
  name: string;
}

export class UserEntity {
  public readonly id: string;
  public readonly name: string;
  public hasVoted: boolean = false;
  public vote?: FibonacciCard;

  constructor(data: CreateUserRequest) {
    this.id = data.id;
    this.name = data.name;
  }

  castVote(vote: FibonacciCard): void {
    this.vote = vote;
    this.hasVoted = true;
  }

  clearVote(): void {
    this.vote = undefined;
    this.hasVoted = false;
  }

  toJSON(): User {
    return {
      id: this.id,
      name: this.name,
      hasVoted: this.hasVoted,
      vote: this.vote,
    };
  }
}