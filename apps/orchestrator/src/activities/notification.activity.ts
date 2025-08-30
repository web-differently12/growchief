import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { NotificationManager } from '@growchief/shared-backend/notifications/notification.manager';

@Injectable()
@Activity()
export class NotificationActivity {
  constructor(private _notificationManager: NotificationManager) {}
  @ActivityMethod()
  async sendNotification(body: {
    orgId: string;
    title: string;
    message: string;
    sendEmail?: boolean;
  }) {
    return this._notificationManager.sendNotification(
      body.orgId,
      body.title,
      body.message,
      body.sendEmail,
    );
  }
}
