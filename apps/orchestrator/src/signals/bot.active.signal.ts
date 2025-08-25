import { defineSignal } from '@temporalio/workflow';

export const botStatus = defineSignal<[boolean]>('botStatus');
