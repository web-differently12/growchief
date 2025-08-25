import { Global, Module } from '@nestjs/common';
import { SharedServerModule } from '@growchief/shared-backend/shared-server.module';
import { ControllersModule } from '@growchief/backend/controllers/controllers.module';
import { AuthService } from '@growchief/backend/services/auth/auth.service';
import { AuthMiddleware } from '@growchief/backend/services/auth/auth.middleware';
import { BotsSockets } from '@growchief/backend/websockets/bots.sockets';
import { getTemporalModule } from '@growchief/shared-backend/temporal/temporal.module';
import { PublicApiModule } from '@growchief/backend/public-api-controllers/public.api.module';
import { TemporalRegisterMissingSearchAttributesModule } from '@growchief/shared-backend/temporal/temporal.register';
import { TemporalClientSubscriptionRegisterModule } from '@growchief/shared-backend/temporal/temporal.client.subscription.register';

@Global()
@Module({
  imports: [
    SharedServerModule,
    ControllersModule,
    PublicApiModule,
    getTemporalModule(false),
    TemporalRegisterMissingSearchAttributesModule,
    TemporalClientSubscriptionRegisterModule,
  ],
  controllers: [],
  providers: [AuthService, AuthMiddleware, BotsSockets],
  get exports() {
    return [...this.providers, ...this.imports];
  },
})
export class AppModule {}
