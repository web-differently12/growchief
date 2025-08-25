import { defineSignal } from '@temporalio/workflow';

export const stepCompleted = defineSignal<[string]>('stepCompleted');
