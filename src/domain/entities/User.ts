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
  private _name: string;
  public hasVoted: boolean = false;
  public vote?: FibonacciCard;

  constructor(data: CreateUserRequest) {
    this.id = data.id;
    this._name = data.name;
  }

  get name(): string {
    return this._name;
  }

  updateName(name: string): void {
    this._name = name;
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
      name: this._name,
      hasVoted: this.hasVoted,
      vote: this.vote,
    };
  }
}