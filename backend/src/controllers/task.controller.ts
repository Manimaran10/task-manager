import { Request, Response, NextFunction } from 'express';
import taskService from '../services/task.service';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../validations/task.validation';
import { catchAsync } from '../utils/catchAsync';

export class TaskController {
  createTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const validatedData = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(validatedData, userId);
    
    res.status(201).json({
      status: 'success',
      data: task
    });
  });

  getTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const validatedQuery = taskQuerySchema.parse(req.query);
    const result = await taskService.getTasks(userId, validatedQuery);
    
    res.status(200).json({
      status: 'success',
      data: result.tasks,
      meta: {
        total: result.total,
        page: validatedQuery.page || 1,
        limit: validatedQuery.limit || 20
      }
    });
  });

  getTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const task = await taskService.getTask(id, userId);
    
    res.status(200).json({
      status: 'success',
      data: task
    });
  });

  updateTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const validatedData = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(id, validatedData, userId);
    
    res.status(200).json({
      status: 'success',
      data: task
    });
  });

  deleteTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const result = await taskService.deleteTask(id, userId);
    
    res.status(200).json(result);
  });

  getDashboard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const data = await taskService.getDashboardData(userId);
    
    res.status(200).json({
      status: 'success',
      data
    });
  });

  getAssignedTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const result = await taskService.getAssignedTasks(userId);
    
    res.status(200).json({
      status: 'success',
      data: result.tasks,
      meta: {
        total: result.total
      }
    });
  });

  getCreatedTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const result = await taskService.getCreatedTasks(userId);
    
    res.status(200).json({
      status: 'success',
      data: result.tasks,
      meta: {
        total: result.total
      }
    });
  });

  getOverdueTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const result = await taskService.getOverdueTasks(userId);
    
    res.status(200).json({
      status: 'success',
      data: result.tasks,
      meta: {
        total: result.total
      }
    });
  });
}

export default new TaskController();