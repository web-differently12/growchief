import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '@growchief/shared-backend/database/notifications/notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private _notificationsRepository: NotificationsRepository) {}

  async getTotalUnreadNotifications(userId: string): Promise<number> {
    return this._notificationsRepository.getTotalUnreadByUserId(userId);
  }

  async getLast10UserNotifications(userId: string) {
    return this._notificationsRepository.getLast10ByUserId(userId);
  }

  async createNotification(
    userId: string,
    title: string,
    content: string,
    additionalInfo?: string,
  ) {
    return this._notificationsRepository.createNotification(
      userId,
      title,
      content,
      additionalInfo,
    );
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    return this._notificationsRepository.markAsRead(notificationId, userId);
  }

  async markAllNotificationsAsRead(userId: string) {
    return this._notificationsRepository.markAllAsRead(userId);
  }
}
