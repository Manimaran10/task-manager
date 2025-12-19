import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import notificationRoutes from './notification.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import userRoutes from './user.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Task Manager API'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);

// Protected test endpoint
router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'You have accessed a protected route',
    user: (req as any).user
  });
});

export default router;