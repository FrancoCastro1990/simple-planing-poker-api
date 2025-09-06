# Planning Poker API

Backend API for Planning Poker application built with TypeScript, Express, Socket.IO, and PostgreSQL following Clean Architecture principles.

## Features

- ✅ **Clean Architecture** with Dependency Injection
- ✅ **TypeScript** with strict type checking
- ✅ **Express.js** REST API
- ✅ **Socket.IO** real-time communication
- ✅ **PostgreSQL** database with migrations
- ✅ **Koi validation** for request validation
- ✅ **Docker** containerization
- ✅ **Health checks** and monitoring

## Quick Start

### Using Docker (Recommended)

```bash
# Clone and enter directory
cd simple-planning-poker-api

# Start with Docker Compose
docker-compose up -d

# Check health
curl http://localhost:3001/health
```

### Manual Development Setup

```bash
# Install dependencies
npm install

# Setup PostgreSQL database
createdb planning_poker

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migrate  # or manually run SQL in migrations/

# Start development server
npm run dev
```

## Architecture

```
src/
├── domain/              # Business logic & interfaces
│   ├── entities/       # Core business entities
│   ├── repositories/   # Repository interfaces
│   └── services/      # Domain service interfaces
├── application/         # Use cases & application services
│   └── services/      # Business logic implementation
├── infrastructure/      # External concerns
│   ├── database/      # PostgreSQL connection & repositories
│   └── socket/       # Socket.IO implementation
├── presentation/        # Controllers & handlers
│   ├── controllers/   # REST API controllers
│   ├── routes/       # Express routes
│   └── socket/      # Socket.IO handlers
├── shared/             # Cross-cutting concerns
│   ├── constants/    # Application constants
│   ├── utils/       # Utility functions
│   ├── validation/  # Koi schemas & middleware
│   └── container/  # Dependency injection container
└── index.ts          # Application entry point
```

## API Endpoints

### REST API

```bash
# Health check
GET /health

# Create room
POST /api/rooms
{
  "title": "Sprint Planning", # optional
  "maxUsers": 10             # optional, default 20
}

# Get room info
GET /api/rooms/:id

# Get room statistics
GET /api/rooms/:id/stats
```

### Socket.IO Events

#### Client → Server

```typescript
// Join room
socket.emit('join-room', {
  roomId: string,
  user: { id: string, name: string }
});

// Vote
socket.emit('vote', {
  roomId: string,
  userId: string,
  vote: FibonacciCard // 0,1,2,3,5,8,13,21,34,55,89,'infinity','unknown'
});

// Reveal votes
socket.emit('reveal-votes', { roomId: string });

// Reset votes
socket.emit('reset-votes', { roomId: string });

// Leave room
socket.emit('leave-room', { roomId: string });
```

#### Server → Client

```typescript
// Room state updated
socket.on('room-state-updated', { room: Room });

// User joined
socket.on('user-joined', { user: User, roomId: string });

// User left
socket.on('user-left', { userId: string, roomId: string });

// Vote cast (no vote value revealed)
socket.on('vote-cast', { userId: string, hasVoted: true, roomId: string });

// Votes revealed with results
socket.on('votes-revealed', { 
  roomId: string,
  results: VoteResult[],
  average: number,
  totalVotes: number
});

// Error
socket.on('error', { message: string, code: string });
```

## Environment Variables

```bash
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/planning_poker
DB_HOST=localhost
DB_PORT=5432
DB_NAME=planning_poker
DB_USER=postgres
DB_PASSWORD=password

# CORS
FRONTEND_URL=http://localhost:5173
```

## Scripts

```bash
npm run dev         # Development server with hot reload
npm run build       # Build for production
npm start          # Start production server
npm run migrate    # Run database migrations (if implemented)
```

## Database Schema

```sql
-- rooms table
CREATE TABLE rooms (
  id VARCHAR(6) PRIMARY KEY,
  title VARCHAR(100),
  max_users INTEGER NOT NULL DEFAULT 20,
  total_score DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Adding New Features

1. **Domain**: Define entities and interfaces in `domain/`
2. **Application**: Implement business logic in `application/services/`
3. **Infrastructure**: Add database/external integrations in `infrastructure/`
4. **Presentation**: Create controllers/handlers in `presentation/`
5. **Register**: Add to DI container in `index.ts`

### Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Docker Production

```bash
# Build production image
docker build -t planning-poker-api .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup

- **Development**: SQLite/PostgreSQL local
- **Production**: PostgreSQL with Redis (optional)
- **Scaling**: Multiple API instances with Redis adapter

## Error Codes

- `ROOM_NOT_FOUND` - Room doesn't exist
- `USER_ALREADY_VOTED` - User trying to vote twice
- `INVALID_ROOM_ID` - Room ID format invalid
- `INVALID_VOTE` - Vote not in Fibonacci sequence
- `NO_VOTES_TO_REVEAL` - No votes cast yet
- `ROOM_FULL` - Maximum users reached
- `DATABASE_ERROR` - Database operation failed
- `VALIDATION_ERROR` - Request validation failed

## Contributing

1. Follow Clean Architecture principles
2. Use TypeScript strict mode
3. Validate all inputs with Koi
4. Add error handling with proper codes
5. Update this README for new features

## License

MIT