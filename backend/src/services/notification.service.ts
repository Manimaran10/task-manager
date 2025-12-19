import notificationRepository from '../repositories/notification.repository';

export class NotificationService {
  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    return await notificationRepository.getUserNotifications(userId, unreadOnly);
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await notificationRepository.markAsRead(notificationId, userId);
    
    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return notification;
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    return await notificationRepository.getUnreadCount(userId);
  }
}

export default new NotificationService();