import { defineSignal } from '@temporalio/workflow';

export const removeNodesFromQueueByNodeIdSignal = defineSignal<[string]>(
  'removeNodesFromQueueByNodeIdSignal',
);

export const removeNodesFromQueueByWorkflowIdSignal = defineSignal<[string]>(
  'removeNodesFromQueueByWorkflowIdSignal',
);
