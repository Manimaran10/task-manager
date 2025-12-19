import { Request, Response, NextFunction } from 'express';
import userRepository from '../repositories/user.repository';
import { catchAsync } from '../utils/catchAsync';

export class UserController {
  getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await userRepository.findAll();
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  });

  searchUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { search } = req.query;
    
    const users = await userRepository.searchUsers(search as string);
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  });
}

export default new UserController();