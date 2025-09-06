import { Router } from 'express';
import { RoomController } from '@presentation/controllers/RoomController';
import { validateBody, validateParams } from '@shared/validation/middleware';
import { createRoomSchema, roomIdSchema } from '@shared/validation/schemas';

const router = Router();
const roomController = new RoomController();

// Health check
router.get('/health', (req, res) => roomController.healthCheck(req, res));

// Room routes
router.post(
  '/api/rooms',
  validateBody(createRoomSchema),
  (req, res) => roomController.createRoom(req, res)
);

router.get(
  '/api/rooms/:id',
  validateParams(roomIdSchema),
  (req, res) => roomController.getRoomById(req, res)
);

router.get(
  '/api/rooms/:id/stats',
  validateParams(roomIdSchema),
  (req, res) => roomController.getRoomStats(req, res)
);

export { router as roomRoutes };