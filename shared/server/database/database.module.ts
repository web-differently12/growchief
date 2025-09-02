import { Global, Module } from '@nestjs/common';
import { OrganizationService } from '@growchief/shared-backend/database/organizations/organization.service';
import { OrganizationRepository } from '@growchief/shared-backend/database/organizations/organization.repository';
import { UsersService } from '@growchief/shared-backend/database/users/users.service';
import { UsersRepository } from '@growchief/shared-backend/database/users/users.repository';
import { SubscriptionRepository } from '@growchief/shared-backend/database/subscription/subscription.repository';
import { SubscriptionService } from '@growchief/shared-backend/database/subscription/subscription.service';
import { NotificationsService } from '@growchief/shared-backend/database/notifications/notifications.service';
import { NotificationsRepository } from '@growchief/shared-backend/database/notifications/notifications.repository';
import { BotsService } from '@growchief/shared-backend/database/bots/bots.service';
import { BotsRepository } from '@growchief/shared-backend/database/bots/bots.repository';
import { WorkflowsService } from '@growchief/shared-backend/database/workflows/workflows.service';
import { WorkflowsRepository } from '@growchief/shared-backend/database/workflows/workflows.repository';
import {
  PrismaRepository,
  PrismaService,
} from '@growchief/shared-backend/database/prisma';
import { LeadsService } from '@growchief/shared-backend/database/leads/leads.service';
import { LeadsRepository } from '@growchief/shared-backend/database/leads/leads.repository';
import { AnalyticsRepository } from '@growchief/shared-backend/database/analytics/analytics.repository';
import { AnalyticsService } from '@growchief/shared-backend/database/analytics/analytics.service';
import { ProxiesService } from '@growchief/shared-backend/database/proxies/proxies.service';
import { ProxiesRepository } from '@growchief/shared-backend/database/proxies/proxies.repository';
import { PlugsRepository } from '@growchief/shared-backend/database/plugs/plugs.repository';
import { PlugsService } from '@growchief/shared-backend/database/plugs/plugs.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    PrismaRepository,
    OrganizationService,
    OrganizationRepository,
    UsersService,
    UsersRepository,
    SubscriptionRepository,
    SubscriptionService,
    NotificationsService,
    NotificationsRepository,
    BotsService,
    BotsRepository,
    WorkflowsService,
    WorkflowsRepository,
    LeadsService,
    LeadsRepository,
    AnalyticsRepository,
    AnalyticsService,
    ProxiesService,
    ProxiesRepository,
    PlugsRepository,
    PlugsService,
  ],
  get exports() {
    return [...this.providers];
  },
})
export class DatabaseModule {}
