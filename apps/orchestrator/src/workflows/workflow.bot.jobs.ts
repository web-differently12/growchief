import {
  CancellationScope,
  condition,
  getExternalWorkflowHandle,
  ParentClosePolicy,
  proxyActivities,
  setHandler,
  sleep,
  startChild,
  workflowInfo,
} from '@temporalio/workflow';
import { userWorkflowThrottler } from '@growchief/orchestrator/workflows/workflow.throttle';
import { TypedSearchAttributes } from '@temporalio/common';
import {
  botId as typedBotId,
  organizationId,
} from '@growchief/shared-backend/temporal/temporal.search.attribute';
import type { WorkflowInformationActivity } from '@growchief/orchestrator/activities/workflow.information.activity';
import { enqueue } from '@growchief/orchestrator/signals/enqueue.signal';
import { stepCompleted } from '@growchief/orchestrator/signals/step.completed.signal';
import { cancelAll } from '@growchief/orchestrator/signals/cancel.all.signal';
import { WorkingHoursManager } from '@growchief/orchestrator/utils/working.hours.manager';

const { getSteps, getTools, saveActivity } =
  proxyActivities<WorkflowInformationActivity>({
    startToCloseTimeout: '2 minute',
  });

export async function workflowBotJobs({
  botId,
  workflowId,
  nodeId,
  url,
  platform,
  leadId,
  orgId,
}: {
  botId: string;
  platform: string;
  workflowId: string;
  nodeId: string;
  leadId: string;
  url: string;
  orgId: string;
}) {
  const { workflowId: workflowIdInternal } = workflowInfo();
  const throttlerId = `user-throttler-${botId}`;

  const steps = await getSteps(workflowId, nodeId);
  if (!steps.length) {
    return;
  }

  const tools = await getTools();

  // Initialize working hours manager for delay calculations
  const workingHoursManager = new WorkingHoursManager(botId);

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
  const scope = new CancellationScope({ cancellable: true });

  setHandler(cancelAll, () => {
    scope.cancel();
  });

  await scope.run(async () => {
    const completedSteps = new Set<string>();

    // Set up signal handler for step completion
    setHandler(stepCompleted, (stepId: string) => {
      completedSteps.add(stepId);
    });

    for (const step of steps) {
      const stepId = step.id;
      const startTime = Date.now();
      await workingHoursManager.ensureWithinWorkingHours();
      const workingHoursWaitTime = Date.now() - startTime;
      if (step.data.identifier === 'delay') {
        // Handle delays within the campaign - calculate actual delay needed after working hours consideration
        const originalDelayMs = step.data.settings.hours * 60 * 60 * 1000;
        const adjustedDelayMs = Math.max(
          0,
          originalDelayMs - workingHoursWaitTime,
        );

        if (adjustedDelayMs > 0) {
          await sleep(adjustedDelayMs);
        }
      } else {
        const tool = tools
          .find((p) => p.identifier === platform)
          ?.tools.find((p) => p.identifier === step.data.identifier)!;

        // Queue actual LinkedIn actions through the throttler
        await throttler.signal(enqueue, {
          botId,
          orgId,
          workflowInternalId: workflowIdInternal,
          workflowId,
          date: Date.now(),
          payload: step.data,
          functionName: tool.methodName,
          url,
          stepId,
          nodeId,
          priority: tool.priority,
          leadId,
          totalRepeat: 0,
          appendUrl: tool.appendUrl,
        });

        // Wait for this step to actually complete before proceeding
        await condition(() => completedSteps.has(stepId));
      }
    }

    await saveActivity(
      leadId,
      orgId,
      'completed',
      botId,
      workflowIdInternal,
      workflowId,
    );
  });
}
