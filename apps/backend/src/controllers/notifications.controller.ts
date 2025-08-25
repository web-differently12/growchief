import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from '@growchief/shared-backend/database/notifications/notifications.service';
import { GetUserFromRequest } from '@growchief/backend/services/auth/user.from.request';
import type { User } from '@prisma/client';
import { SubscriptionRequired } from '@growchief/shared-backend/billing/billing.guard';

@SubscriptionRequired()
@Controller('/notifications')
export class NotificationsController {
  constructor(private _notificationsService: NotificationsService) {}

  @Get('/unread-count')
  async getUnreadCount(@GetUserFromRequest() user: User) {
    return {
      count: await this._notificationsService.getTotalUnreadNotifications(
        user.id,
      ),
    };
  }

  @Get('/recent')
  async getRecentNotifications(@GetUserFromRequest() user: User) {
    const recent = await this._notificationsService.getLast10UserNotifications(
      user.id,
    );
    await this._notificationsService.markAllNotificationsAsRead(user.id);
    return recent;
  }
}
