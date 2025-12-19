import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/auth.validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.patch('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);
router.get('/search', authMiddleware, authController.searchUsers);

export default router;