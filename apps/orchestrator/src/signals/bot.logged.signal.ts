import { defineSignal } from '@temporalio/workflow';

export const botLoggedSignal = defineSignal<[boolean]>('botLoggedSignal');
