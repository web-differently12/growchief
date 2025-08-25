import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@growchief/shared-backend/database/prisma';

@Injectable()
export class NotificationsRepository {
  constructor(private _notification: PrismaRepository<'notification'>) {}

  async getTotalUnreadByUserId(userId: string): Promise<number> {
    return this._notification.model.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async getLast10ByUserId(userId: string) {
    return this._notification.model.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        title: true,
        content: true,
        additionalInfo: true,
        read: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createNotification(
    userId: string,
    title: string,
    content: string,
    additionalInfo?: string,
  ) {
    return this._notification.model.notification.create({
      data: {
        userId,
        title,
        content,
        additionalInfo,
        read: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        additionalInfo: true,
        read: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this._notification.model.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this._notification.model.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }
}
