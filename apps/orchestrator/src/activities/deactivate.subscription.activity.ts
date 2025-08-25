import { Injectable } from '@nestjs/common';
import {
  Activity,
  ActivityMethod,
  TemporalService,
} from 'nestjs-temporal-core';
import type { CancelSubscriptionParam } from '@growchief/orchestrator/workflows/workflow.subscription.deactivate';
import { BotsService } from '@growchief/shared-backend/database/bots/bots.service';
import { SubscriptionService } from '@growchief/shared-backend/database/subscription/subscription.service';

@Injectable()
@Activity()
export class DeactivateSubscriptionActivity {
  constructor(
    private _temporalService: TemporalService,
    private _botsService: BotsService,
    private _subscriptionService: SubscriptionService,
  ) {}
  @ActivityMethod()
  async cancelAllWorkflows(body: CancelSubscriptionParam) {
    const workflows = this._temporalService
      .getClient()
      .listWorkflows(
        `organizationId="${body.organizationId}" AND ExecutionStatus="Running"`,
      );
    for await (const workflow of workflows) {
      try {
        await (
          await this._temporalService
            .getClient()
            .getWorkflowHandle(workflow.workflowId)
        ).terminate('Subscription deactivated');
      } catch (err) {}
    }
  }

  @ActivityMethod()
  async disableAll(body: CancelSubscriptionParam) {
    await this._botsService.disableAll(body.organizationId);
  }

  @ActivityMethod()
  async removeSubscription(body: CancelSubscriptionParam) {
    await this._subscriptionService.deleteSubscription(body.organizationId);
  }

  @ActivityMethod()
  disableAllProxies(body: CancelSubscriptionParam) {
    return this._botsService.disableAllProxies(body.organizationId);
  }
}
