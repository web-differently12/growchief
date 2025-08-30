import { Injectable } from '@nestjs/common';
import { NotificationsService } from '@growchief/shared-backend/database/notifications/notifications.service';
import { OrganizationService } from '@growchief/shared-backend/database/organizations/organization.service';
import { EmailService } from '@growchief/shared-backend/email/email.service';

@Injectable()
export class NotificationManager {
  constructor(
    private _notificationService: NotificationsService,
    private _organizationService: OrganizationService,
    private _emailService: EmailService,
  ) {}
  async sendNotification(
    organizationId: string,
    title: string,
    message: string,
    sendEmail = false,
  ) {
    const orgUsers =
      await this._organizationService.listUsersPerOrganization(organizationId);

    await Promise.all(
      orgUsers.map((p) =>
        this._notificationService.createNotification(p.user.id, title, message),
      ),
    );

    if (!sendEmail) return;

    for (const user of orgUsers) {
      await this._emailService.sendEmail(user.user.email, title, message);
    }
  }
}
