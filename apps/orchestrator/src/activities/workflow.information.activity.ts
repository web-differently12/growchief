import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { BotsService } from '@growchief/shared-backend/database/bots/bots.service';
import { WorkflowsService } from '@growchief/shared-backend/database/workflows/workflows.service';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import { WorkflowNodes } from '@growchief/orchestrator/workflows';
import { EnrichmentManager } from '@growchief/shared-backend/enrichment/enrichment.manager';
import { botList } from '@growchief/shared-backend/bots/bot.list';
import { URLService } from '@growchief/shared-both/utils/url.normalize';
import type { RestrictionType } from '@growchief/shared-backend/temporal/progress.response';
import dayjs from 'dayjs';

@Injectable()
@Activity()
export class WorkflowInformationActivity {
  constructor(
    private _botsService: BotsService,
    private _workflowService: WorkflowsService,
    private _enrichmentService: EnrichmentManager,
    private _urlService: URLService,
  ) {}

  @ActivityMethod()
  async getBot(botId: string) {
    return this._botsService.getBot(botId);
  }

  @ActivityMethod()
  async getSteps(workflowId: string, nodeId: string) {
    return this._workflowService.getNodesSteps(workflowId, nodeId);
  }

  @ActivityMethod()
  async getTools() {
    return this._botsService.getTools();
  }

  @ActivityMethod()
  async saveActivity(
    leadId: string,
    organizationId: string,
    type: string,
    botId: string,
    stepId: string,
    workflowId: string,
  ) {
    return this._botsService.saveActivity(
      leadId,
      organizationId,
      type,
      botId,
      stepId,
      workflowId,
    );
  }

  @ActivityMethod()
  async getWorkflowAndNodes(workflowId: string, body: EnrichmentDto) {
    const workflow =
      await this._workflowService.getWorkflowAccounts(workflowId);
    if (!workflow || !workflow?.workflow?.active) {
      return false;
    }

    const listFlows: WorkflowNodes[] = [];

    for (const node of workflow.children) {
      const data = JSON.parse(node.data || '{}');
      const botModel = await this._botsService.getBot(data.account.id);

      if (botModel?.status === 'PAUSED' || botModel?.deletedAt) {
        return;
      }

      const getBot = botList.find(
        (p) => p.identifier === data.account.platform,
      );

      if (!getBot) {
        continue;
      }

      body.urls = body?.urls?.length
        ? body.urls.map((url) => {
            const normalized = this._urlService.normalizeUrlSafe(url);
            if (getBot.isWWW) {
              return normalized.indexOf('//www.') === -1
                ? normalized.replace('://', '://www.')
                : normalized;
            } else {
              return normalized.replace('://www.', '://');
            }
          })
        : [];

      const lead = await this._enrichmentService.processEnrichment(
        workflow.organizationId,
        workflowId,
        data.account.platform,
        body,
      );

      if (!lead) {
        continue;
      }

      const url = lead.url.match(getBot.urlRegex);

      if (!url) {
        continue;
      }

      listFlows.push({
        platform: data.account.platform,
        organizationId: workflow.organizationId,
        workflowId: workflowId,
        nodeId: node.id,
        botId: data.account.id,
        url: lead.url,
        leadId: lead.id,
      });
    }

    return listFlows;
  }

  @ActivityMethod()
  async getWorkingHours(
    botId: string,
  ): Promise<{ workingHours: number[][]; timezone: number }> {
    const bot = await this._botsService.getBot(botId);
    return {
      workingHours: JSON.parse(bot?.workingHours || '[]'),
      timezone: bot?.timezone || 0,
    };
  }

  @ActivityMethod()
  async getStepRestrictions(botId: string, activityName: string) {
    return this._botsService.getStepRestrictions(botId, activityName);
  }

  @ActivityMethod()
  async saveRestriction(
    botId: string,
    methodName: string,
    type: RestrictionType,
  ) {
    if (type === 'weekly') {
      const date = dayjs
        .utc()
        .endOf('week')
        .add(2, 'day')
        .startOf('week')
        .toDate();
      await this._botsService.saveRestriction(botId, methodName, date);
    }
  }
}
