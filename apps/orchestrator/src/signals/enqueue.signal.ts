import { defineSignal } from '@temporalio/workflow';
import { Work } from '@growchief/orchestrator/workflows';

export const enqueue = defineSignal<[Work]>('enqueue');
