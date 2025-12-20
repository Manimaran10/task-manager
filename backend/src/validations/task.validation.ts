import { z } from 'zod';

// Define enums here instead of importing (to avoid circular dependency)
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed'
}

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  priority: z.nativeEnum(TaskPriority),
  assignedToId: z.string().min(1, 'Assignee is required')
});

export const updateTaskSchema = z.object({
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
  description: z.string().optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedToId: z.string().optional()
});

export const taskQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  sortBy: z.enum(['dueDate', 'createdAt', 'priority','title']).optional().default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1).refine(val => val > 0, 'Page must be positive'),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type TaskQueryDto = z.infer<typeof taskQuerySchema>;