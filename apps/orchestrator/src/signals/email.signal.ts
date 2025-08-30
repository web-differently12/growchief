import { defineSignal } from '@temporalio/workflow';
import { SendEmailQueue } from '@growchief/orchestrator/workflows/workflow.email';

export const emailSignal = defineSignal<[SendEmailQueue]>('email');
