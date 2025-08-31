import { defineQuery } from '@temporalio/workflow';

interface BotJobsResponse {
  stepId: string;
  workflowId: string;
  when: number;
}

export const botJobsQueries = defineQuery<BotJobsResponse | false, []>(
  'botJobsQueries',
);
