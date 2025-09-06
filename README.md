# Simple Planning Poker API

Backend API para aplicación Planning Poker construida con TypeScript, Express, Socket.IO y PostgreSQL siguiendo principios de Clean Architecture.

## 🚀 Características

- 🏗️ **Clean Architecture** con Inyección de Dependencias
- 📘 **TypeScript** con verificación estricta de tipos
- 🌐 **Express.js** API REST
- ⚡ **Socket.IO** comunicación en tiempo real
- 🐘 **PostgreSQL** base de datos con migraciones
- ✅ **Validación Zod** para validación de requests
- 🐳 **Docker** containerización completa
- 🔍 **Health checks** y monitoreo
- 🧹 **Limpieza automática** de salas vacías

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Language**: TypeScript 5.3.3
- **Real-time**: Socket.IO 4.7.5
- **Database**: PostgreSQL 15
- **Validation**: Zod 3.22.4
- **Containerization**: Docker & Docker Compose
- **Development**: tsx (hot reload)

## 📁 Arquitectura del Proyecto

```
src/
├── domain/                           # Lógica de negocio e interfaces
│   ├── entities/
│   │   ├── Room.ts                  # Entidad Room con lógica de votación
│   │   └── User.ts                  # Entidad User con estados
│   ├── repositories/
│   │   └── IRoomRepository.ts       # Interface repositorio
│   └── services/
│       ├── IRoomService.ts          # Interface servicio de salas
│       └── ISocketService.ts        # Interface servicio Socket.IO
├── application/                      # Casos de uso y servicios
│   └── services/
│       └── RoomService.ts           # Implementación lógica de negocio
├── infrastructure/                   # Preocupaciones externas
│   ├── database/
│   │   ├── connection.ts            # Conexión PostgreSQL
│   │   ├── migrate.ts               # Sistema de migraciones
│   │   ├── migrations/
│   │   │   └── 001_create_rooms_table.sql
│   │   └── repositories/
│   │       └── RoomRepository.ts    # Implementación repositorio
│   └── socket/
│       └── SocketService.ts         # Implementación Socket.IO
├── presentation/                     # Controladores y manejadores
│   ├── controllers/
│   │   └── RoomController.ts        # Controladores REST API
│   ├── routes/
│   │   └── roomRoutes.ts           # Rutas Express
│   └── socket/
│       └── SocketHandlers.ts       # Manejadores Socket.IO
├── shared/                          # Preocupaciones transversales
│   ├── constants/
│   │   └── index.ts                # Constantes de aplicación
│   ├── container/
│   │   └── Container.ts            # Contenedor de inyección de dependencias
│   ├── utils/
│   │   └── index.ts               # Funciones utilitarias
│   └── validation/
│       ├── middleware.ts          # Middleware de validación
│       └── schemas.ts            # Esquemas Zod
└── index.ts                        # Punto de entrada de aplicación
```

## ⚡ Inicio Rápido

### Usando Docker (Recomendado)

```bash
# Clonar y entrar al directorio
cd simple-planning-poker-api

# Iniciar con Docker Compose
docker-compose up -d

# Verificar salud
curl http://localhost:3001/health
```

### Configuración Manual de Desarrollo

```bash
# Instalar dependencias
npm install

# Configurar base de datos PostgreSQL
createdb planning_poker

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de base de datos

# Ejecutar migraciones
npm run migrate

# Iniciar servidor de desarrollo
npm run dev
```

## 📡 Endpoints API

### REST API

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "Planning Poker API is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

#### Crear Sala
```http
POST /api/rooms
Content-Type: application/json

{
  "title": "Sprint Planning",  // opcional
  "maxUsers": 10              // opcional, default 20
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ABC123",
    "title": "Sprint Planning",
    "maxUsers": 10,
    "users": [],
    "votes": {},
    "isRevealed": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "totalScore": 0
  }
}
```

#### Obtener Información de Sala
```http
GET /api/rooms/:id
```

#### Obtener Estadísticas de Sala
```http
GET /api/rooms/:id/stats
```

### WebSocket Events (Socket.IO)

#### Cliente → Servidor

```typescript
// Unirse a sala
socket.emit('join-room', {
  roomId: 'ABC123',
  user: { 
    id: 'user-123', 
    name: 'John Doe' 
  }
});

// Votar
socket.emit('vote', {
  roomId: 'ABC123',
  userId: 'user-123',
  vote: 5 // FibonacciCard: 0|1|2|3|5|8|13|21|34|55|89|'infinity'|'unknown'
});

// Revelar votos
socket.emit('reveal-votes', { 
  roomId: 'ABC123' 
});

// Resetear votos
socket.emit('reset-votes', { 
  roomId: 'ABC123' 
});

// Salir de sala
socket.emit('leave-room', { 
  roomId: 'ABC123' 
});
```

#### Servidor → Cliente

```typescript
// Estado de sala actualizado
socket.on('room-state-updated', (data) => {
  console.log('Room updated:', data.room);
});

// Usuario se unió
socket.on('user-joined', (data) => {
  console.log('User joined:', data.user, 'in room:', data.roomId);
});

// Usuario salió
socket.on('user-left', (data) => {
  console.log('User left:', data.userId, 'from room:', data.roomId);
});

// Voto emitido (sin revelar valor)
socket.on('vote-cast', (data) => {
  console.log('User voted:', data.userId, 'hasVoted:', data.hasVoted);
});

// Votos revelados con resultados
socket.on('votes-revealed', (data) => {
  console.log('Results:', data.results, 'Average:', data.average);
});

// Error
socket.on('error', (error) => {
  console.error('Socket error:', error.message, 'Code:', error.code);
});
```

## 🗄️ Base de Datos

### Esquema PostgreSQL

```sql
-- Tabla de salas
CREATE TABLE rooms (
    id VARCHAR(6) PRIMARY KEY,
    title VARCHAR(100),
    max_users INTEGER NOT NULL DEFAULT 20,
    total_score DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para rendimiento
CREATE INDEX idx_rooms_updated_at ON rooms(updated_at);
CREATE INDEX idx_rooms_created_at ON rooms(created_at);
```

### Configuración de Conexión

La aplicación usa un pool de conexiones PostgreSQL con las siguientes configuraciones:

- **Max conexiones**: 20
- **Idle timeout**: 10000ms
- **Connection timeout**: 2000ms
- **Health check**: Cada conexión

## ⚙️ Variables de Entorno

```bash
# Entorno
NODE_ENV=development
PORT=3001

# Base de Datos
DATABASE_URL=postgresql://postgres:password@localhost:5432/planning_poker
DB_HOST=localhost
DB_PORT=5432
DB_NAME=planning_poker
DB_USER=postgres
DB_PASSWORD=password

# CORS
FRONTEND_URL=http://localhost:5173
```

## 📜 Scripts Disponibles

```bash
npm run dev         # Servidor de desarrollo con hot reload
npm run build       # Build para producción
npm run start       # Iniciar servidor de producción
npm run migrate     # Ejecutar migraciones de base de datos
npm run test        # Ejecutar tests
npm run test:coverage # Tests con cobertura
npm run lint        # Linting de código
npm run lint:fix    # Fix automático de linting
```

## 🏗️ Principios de Clean Architecture

### Domain Layer (Dominio)
- **Entities**: `Room`, `User` con lógica de negocio pura
- **Repositories**: Interfaces para persistencia
- **Services**: Interfaces para servicios de dominio

### Application Layer (Aplicación)
- **Services**: Implementación de casos de uso
- **DTOs**: Objetos de transferencia de datos

### Infrastructure Layer (Infraestructura)
- **Database**: Implementaciones de repositorios
- **Socket**: Implementaciones de servicios Socket.IO
- **External Services**: Integraciones externas

### Presentation Layer (Presentación)
- **Controllers**: Manejo de requests HTTP
- **Routes**: Configuración de rutas Express
- **Socket Handlers**: Manejo de eventos Socket.IO

## 🔧 Características Técnicas

### Inyección de Dependencias
```typescript
// Container.ts - Singleton pattern
const container = Container.getInstance();
container.registerDependencies(db, io);
const roomService = container.getRoomService();
```

### Validación de Datos
```typescript
// Usando Zod schemas
const createRoomSchema = z.object({
  title: z.string().max(100).optional(),
  maxUsers: z.number().int().min(1).max(50).optional()
});
```

### Manejo de Errores
```typescript
// Códigos de error consistentes
export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  INVALID_VOTE: 'INVALID_VOTE',
  // ...más códigos
} as const;
```

### Limpieza Automática
- Limpieza de salas vacías cada 5 minutos
- Desconexión automática de usuarios inactivos
- Logs detallados de operaciones

## 🐳 Docker & Despliegue

### Docker Compose
```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: planning_poker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
```

### Build de Producción
```bash
# Build imagen Docker
docker build -t simple-planning-poker-api .

# Ejecutar contenedor
docker run -p 3001:3001 simple-planning-poker-api
```

## 🚨 Códigos de Error

| Código | Descripción |
|--------|-------------|
| `ROOM_NOT_FOUND` | Sala no existe |
| `USER_ALREADY_VOTED` | Usuario intentando votar dos veces |
| `INVALID_ROOM_ID` | Formato de ID de sala inválido |
| `INVALID_VOTE` | Voto no está en secuencia Fibonacci |
| `NO_VOTES_TO_REVEAL` | No hay votos para revelar |
| `ROOM_FULL` | Máximo de usuarios alcanzado |
| `DATABASE_ERROR` | Error en operación de base de datos |

## 🔮 Próximas Mejoras

- [ ] Autenticación de usuarios con JWT
- [ ] Rate limiting para prevenir spam
- [ ] Redis para escalamiento horizontal
- [ ] Métricas y monitoring avanzado
- [ ] API versioning
- [ ] Tests unitarios e integración
- [ ] CI/CD pipeline
- [ ] Documentación OpenAPI/Swagger

## 📄 Licencia

Este proyecto es privado y no está disponible bajo ninguna licencia pública.