import Notification, { INotification, NotificationType } from '../models/Notification';
import { BaseRepository } from './base.repository';
import { Types } from 'mongoose';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }

  async createNotification(data: {
    userId: Types.ObjectId;
    type: NotificationType;
    message: string;
    taskId?: Types.ObjectId;
  }): Promise<INotification> {
    return await this.create(data);
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<INotification[]> {
    const filter: any = { userId: new Types.ObjectId(userId) };
    
    if (unreadOnly) {
      filter.isRead = false;
    }

    return await this.find(filter, {
      sort: { createdAt: -1 },
      limit: 50
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return await this.model.findOneAndUpdate(
      {
        _id: notificationId,
        userId: new Types.ObjectId(userId)
      },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.model.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.count({
      userId: new Types.ObjectId(userId),
      isRead: false
    });
  }
}

export default new NotificationRepository();