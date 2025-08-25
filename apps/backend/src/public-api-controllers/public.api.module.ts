import { APP_GUARD } from '@nestjs/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PermissionsGuard } from '@growchief/shared-backend/billing/billing.guard';
import { PublicApiController } from '@growchief/backend/public-api-controllers/public.api.controller';
import { PublicAuthMiddleware } from '@growchief/backend/services/auth/public.auth.middleware';

const authControllers = [PublicApiController];

@Module({
  imports: [],
  controllers: [...authControllers],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [],
})
export class PublicApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PublicAuthMiddleware).forRoutes(...authControllers);
  }
}
