import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from '@growchief/shared-backend/billing/billing.guard';
import { UsersController } from '@growchief/backend/controllers/users.controller';
import { OrganizationsController } from '@growchief/backend/controllers/organizations.controller';
import { BillingController } from '@growchief/backend/controllers/billing.controller';
import { TeamController } from '@growchief/backend/controllers/team.controller';
import { AuthController } from '@growchief/backend/controllers/auth.controller';
import { RootController } from '@growchief/backend/controllers/root.controller';
import { WebhookController } from '@growchief/backend/controllers/webhook.controller';
import { AuthMiddleware } from '@growchief/backend/services/auth/auth.middleware';
import { NotificationsController } from '@growchief/backend/controllers/notifications.controller';
import { BotsController } from '@growchief/backend/controllers/bots.controller';
import { WorkflowsController } from '@growchief/backend/controllers/workflows.controller';
import { AnalyticsController } from '@growchief/backend/controllers/analytics.controller';
import { LeadsController } from '@growchief/backend/controllers/leads.controller';
import { ProxiesController } from '@growchief/backend/controllers/proxies.controller';
import { PlugsController } from '@growchief/backend/controllers/plugs.controller';

const authControllers = [
  UsersController,
  OrganizationsController,
  AnalyticsController,
  BillingController,
  TeamController,
  NotificationsController,
  BotsController,
  WorkflowsController,
  LeadsController,
  ProxiesController,
  PlugsController,
];

@Module({
  imports: [],
  controllers: [
    AuthController,
    RootController,
    WebhookController,
    ...authControllers,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [],
})
export class ControllersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(...authControllers);
  }
}
