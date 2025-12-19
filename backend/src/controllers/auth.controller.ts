import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/auth.validation';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/errors';

export class AuthController {
  register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  });

  login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const user = await authService.getProfile(userId);
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  });

  updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(userId, validatedData);
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  });

  searchUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      throw new AppError('Search query is required', 400);
    }

    const users = await authService.searchUsers(q, userId);
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  });
}

export default new AuthController();