import { Router } from 'express';
import taskController from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema } from '../validations/task.validation';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// Task CRUD operations
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/dashboard', taskController.getDashboard);
router.get('/assigned', taskController.getAssignedTasks);
router.get('/created', taskController.getCreatedTasks);
router.get('/overdue', taskController.getOverdueTasks);
router.get('/:id', taskController.getTask);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;