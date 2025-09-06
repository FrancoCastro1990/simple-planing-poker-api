import { Pool } from 'pg';
import { Server } from 'socket.io';

import { IRoomRepository } from '@domain/repositories/IRoomRepository';
import { IRoomService } from '@domain/services/IRoomService';
import { ISocketService } from '@domain/services/ISocketService';

import { RoomRepository } from '@infrastructure/database/repositories/RoomRepository';
import { SocketService } from '@infrastructure/socket/SocketService';
import { RoomService } from '@application/services/RoomService';

export class Container {
  private static instance: Container;
  private dependencies: Map<string, () => any> = new Map();
  private singletons: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register<T>(token: string, factory: () => T): void {
    this.dependencies.set(token, factory);
  }

  resolve<T>(token: string): T {
    // Check if singleton already exists
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    const factory = this.dependencies.get(token);
    if (!factory) {
      throw new Error(`Dependency ${token} not found`);
    }
    
    // Create and cache the singleton
    const instance = factory();
    this.singletons.set(token, instance);
    return instance;
  }

  registerDependencies(db: Pool, io: Server): void {
    // Register database
    this.register<Pool>('database', () => db);
    
    // Register Socket.IO server
    this.register<Server>('socketServer', () => io);

    // Register repositories
    this.register<IRoomRepository>('roomRepository', () => 
      new RoomRepository(this.resolve<Pool>('database'))
    );

    // Register services
    this.register<IRoomService>('roomService', () => 
      new RoomService(this.resolve<IRoomRepository>('roomRepository'))
    );

    this.register<ISocketService>('socketService', () => 
      new SocketService(this.resolve<Server>('socketServer'))
    );
  }

  // Convenience methods for common dependencies
  getRoomService(): IRoomService {
    return this.resolve<IRoomService>('roomService');
  }

  getSocketService(): ISocketService {
    return this.resolve<ISocketService>('socketService');
  }

  getRoomRepository(): IRoomRepository {
    return this.resolve<IRoomRepository>('roomRepository');
  }
}