import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { getPool } from '@infrastructure/database/connection';
import { Container } from '@shared/container/Container';
import { roomRoutes } from '@presentation/routes/roomRoutes';
import { SocketHandlers } from '@presentation/socket/SocketHandlers';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

async function startServer() {
  try {
    // Initialize database connection
    console.log('🔗 Connecting to database...');
    const db = await getPool();
    
    // Test database connection
    await db.query('SELECT 1');
    console.log('✅ Database connection established');

    // Create Express app
    const app = express();
    const server = createServer(app);

    // Setup CORS
    app.use(cors({
      origin: FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }));

    // Parse JSON
    app.use(express.json());

    // Setup Socket.IO with CORS
    const io = new Server(server, {
      cors: {
        origin: FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Initialize dependency injection container
    const container = Container.getInstance();
    container.registerDependencies(db, io);

    // Setup routes
    app.use('/', roomRoutes);

    // Setup Socket.IO handlers
    const socketHandlers = new SocketHandlers();
    io.on('connection', socketHandlers.handleConnection);

    // Error handling middleware
    app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          message: 'Not found',
          code: 'NOT_FOUND',
        },
      });
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      
      // Log available endpoints
      console.log('📍 Available endpoints:');
      console.log('   GET  /health');
      console.log('   POST /api/rooms');
      console.log('   GET  /api/rooms/:id');
      console.log('   GET  /api/rooms/:id/stats');
      console.log('🔌 Socket.IO events: join-room, leave-room, vote, reveal-votes, reset-votes');
    });

    // Setup cleanup for empty rooms (every 5 minutes)
    const roomService = container.getRoomService();
    setInterval(async () => {
      try {
        const cleanedCount = await roomService.cleanupEmptyRooms();
        if (cleanedCount > 0) {
          console.log(`🧹 Cleaned up ${cleanedCount} empty rooms`);
        }
      } catch (error) {
        console.error('Room cleanup error:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        db.end(() => {
          console.log('✅ Database connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        db.end(() => {
          console.log('✅ Database connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

// Start the server
startServer();