import { Global, Injectable, Module, OnModuleInit } from '@nestjs/common';
import { TemporalService } from 'nestjs-temporal-core';

@Injectable()
export class TemporalClientSubscriptionRegister implements OnModuleInit {
  constructor(private _temporalService: TemporalService) {}

  async onModuleInit(): Promise<void> {
    try {
      if (!!process.env.EMAIL_PROVIDER) {
        await this._temporalService
          ?.getClient()
          ?.getRawClient()
          ?.workflow?.start('workflowEmail', {
            workflowId: 'send-emails',
            taskQueue: 'main',
          });
      }

      if (!!process.env.BILLING_PROVIDER) {
        await this._temporalService
          ?.getClient()
          ?.getRawClient()
          ?.workflow?.start('workflowSubscriptionDeactivate', {
            workflowId: 'subscription-deactivate',
            taskQueue: 'main',
          });
      }
    } catch (err) {}
  }
}

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [TemporalClientSubscriptionRegister],
  get exports() {
    return this.providers;
  },
})
export class TemporalClientSubscriptionRegisterModule {}
