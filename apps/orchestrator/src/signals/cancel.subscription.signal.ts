import { defineSignal } from '@temporalio/workflow';
import { CancelSubscriptionParam } from '@growchief/orchestrator/workflows/workflow.subscription.deactivate';

export const cancelSubscription =
  defineSignal<[CancelSubscriptionParam]>('cancelSubscription');
