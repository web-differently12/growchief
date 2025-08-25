import {
  defineSearchAttributeKey,
  SearchAttributeType,
} from '@temporalio/common';

export const organizationId = defineSearchAttributeKey(
  'organizationId',
  SearchAttributeType.TEXT,
);

export const workflowId = defineSearchAttributeKey(
  'workflowId',
  SearchAttributeType.TEXT,
);

export const nodeId = defineSearchAttributeKey(
  'nodeId',
  SearchAttributeType.TEXT,
);

export const botId = defineSearchAttributeKey(
  'botId',
  SearchAttributeType.TEXT,
);
