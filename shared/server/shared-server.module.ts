import { Global, Module } from '@nestjs/common';
import { EmailService } from '@growchief/shared-backend/email/email.service';
import { UploadService } from '@growchief/shared-backend/upload/upload.service';
import { BillingProvider } from '@growchief/shared-backend/billing/billing.provider';
import {
  PermissionsGuard,
  SubscriptionGuard,
} from '@growchief/shared-backend/billing/billing.guard';
import {
  PermissionList,
  permissionsList,
} from '@growchief/shared-backend/billing/permissions.list';
import { NewsletterService } from '@growchief/shared-backend/newsletter/newsletter.service';
import { DatabaseModule } from '@growchief/shared-backend/database/database.module';
import { BotManager } from '@growchief/shared-backend/bots/bot.manager';
import { ProxiesManager } from '@growchief/shared-backend/proxies/proxies.manager';
import { URLService } from '@growchief/shared-both/utils/url.normalize';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [
    EmailService,
    NewsletterService,
    UploadService,
    BillingProvider,
    PermissionsGuard,
    SubscriptionGuard,
    BotManager,
    ...permissionsList,
    PermissionList,
    ProxiesManager,
    URLService,
  ],
  get exports() {
    return [...this.providers, ...this.imports];
  },
})
export class SharedServerModule {}
