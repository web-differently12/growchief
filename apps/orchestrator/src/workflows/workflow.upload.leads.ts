import {
  getExternalWorkflowHandle,
  ParentClosePolicy,
  startChild,
  workflowInfo,
} from '@temporalio/workflow';
import { userWorkflowThrottler } from '@growchief/orchestrator/workflows/workflow.throttle';
import { TypedSearchAttributes } from '@temporalio/common';
import {
  botId as typedBotId,
  organizationId,
} from '@growchief/shared-backend/temporal/temporal.search.attribute';
import { enqueue } from '@growchief/orchestrator/signals/enqueue.signal';
import { makeId } from '@growchief/shared-both/utils/make.id';

export async function workflowUploadLeads({
  botId,
  workflowId,
  url,
  orgId,
}: {
  botId: string;
  workflowId: string;
  url: string;
  orgId: string;
}) {
  const { workflowId: workflowIdInternal } = workflowInfo();
  const throttlerId = `user-throttler-${botId}`;

  try {
    await startChild(userWorkflowThrottler, {
      args: [{}],
      workflowId: throttlerId,
      taskQueue: 'main',
      parentClosePolicy: ParentClosePolicy.ABANDON,
      cancellationType: 'ABANDON' as const,
      typedSearchAttributes: new TypedSearchAttributes([
        {
          key: typedBotId,
          value: botId,
        },
        {
          key: organizationId,
          value: orgId,
        },
      ]),
    });
  } catch (error) {}

  const throttler = getExternalWorkflowHandle(throttlerId);

  await throttler.signal(enqueue, {
    botId,
    orgId,
    workflowInternalId: workflowIdInternal,
    workflowId,
    date: Date.now(),
    payload: { url },
    functionName: 'leadList',
    url,
    stepId: 'leadList',
    nodeId: makeId(1000),
    priority: -1,
    leadId: 'ignore',
    totalRepeat: 0,
    ignoreLead: true,
  });
}
