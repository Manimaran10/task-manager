import { Router } from 'express';
import userController from '../controllers/user.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, userController.getUsers);
router.get('/search', authMiddleware, userController.searchUsers);

export default router;