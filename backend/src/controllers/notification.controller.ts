import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notification.service';
import { catchAsync } from '../utils/catchAsync';

export class NotificationController {
  getNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const { unread } = req.query;
    const unreadOnly = unread === 'true';
    
    const notifications = await notificationService.getUserNotifications(userId, unreadOnly);
    
    res.status(200).json({
      status: 'success',
      data: notifications
    });
  });

  markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(id, userId);
    
    res.status(200).json({
      status: 'success',
      data: notification
    });
  });

  markAllAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    
    const result = await notificationService.markAllAsRead(userId);
    
    res.status(200).json(result);
  });

  getUnreadCount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.userId;
    
    const count = await notificationService.getUnreadCount(userId);
    
    res.status(200).json({
      status: 'success',
      data: { count }
    });
  });
}

export default new NotificationController();