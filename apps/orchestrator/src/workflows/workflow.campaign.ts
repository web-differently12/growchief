import { proxyActivities, startChild } from '@temporalio/workflow';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import type { WorkflowInformationActivity } from '@growchief/orchestrator/activities/workflow.information.activity';
import { workflowBotJobs } from '@growchief/orchestrator/workflows/workflow.bot.jobs';
import { TypedSearchAttributes } from '@temporalio/common';
import {
  botId,
  nodeId,
  organizationId,
  workflowId,
} from '@growchief/shared-backend/temporal/temporal.search.attribute';
import { makeId } from '@growchief/shared-both/utils/make.id';

const { getWorkflowAndNodes } = proxyActivities<WorkflowInformationActivity>({
  startToCloseTimeout: '2 minute',
});

export interface WorkflowNodes {
  organizationId: string;
  workflowId: string;
  nodeId: string;
  botId: string;
  url: string;
  platform: string;
  leadId: string;
}
export async function workflowCampaign(args: {
  orgId: string;
  workflowId: string;
  body: EnrichmentDto;
}): Promise<void> {
  const workflowDetails = await getWorkflowAndNodes(args.workflowId, args.body);
  if (!workflowDetails) {
    return;
  }

  for (const node of workflowDetails) {
    await startChild(workflowBotJobs, {
      workflowId: 'workflow-bot-jobs-' + makeId(10),
      args: [
        {
          orgId: args.orgId,
          botId: node.botId,
          workflowId: node.workflowId,
          nodeId: node.nodeId,
          url: node.url,
          platform: node.platform,
          leadId: node.leadId,
        },
      ],
      typedSearchAttributes: new TypedSearchAttributes([
        {
          key: organizationId,
          value: args.orgId,
        },
        {
          key: workflowId,
          value: node.workflowId,
        },
        {
          key: nodeId,
          value: node.nodeId,
        },
        {
          key: botId,
          value: node.botId,
        },
      ]),
      parentClosePolicy: 'ABANDON' as const,
    });
  }

  return;
}
