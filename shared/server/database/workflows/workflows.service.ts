import { Injectable } from '@nestjs/common';
import { WorkflowsRepository } from '@growchief/shared-backend/database/workflows/workflows.repository';
import { UpdateWorkflow } from '@growchief/shared-both/dto/platforms/update.workflow.dto';
import { TemporalService } from 'nestjs-temporal-core';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import { WorkflowNodes as WorkflowNodesInterface } from '@prisma/client';
import { makeId } from '@growchief/shared-both/utils/make.id';
import { TypedSearchAttributes } from '@temporalio/common';
import {
  botId,
  organizationId,
  workflowId,
} from '@growchief/shared-backend/temporal/temporal.search.attribute';
import { BotsService } from '@growchief/shared-backend/database/bots/bots.service';
import { uniq } from 'lodash';
import { botList } from '@growchief/shared-backend/bots/bot.list';

@Injectable()
export class WorkflowsService {
  constructor(
    private _workflowsRepository: WorkflowsRepository,
    private _temporal: TemporalService,
    private _botsService: BotsService,
  ) {}

  static mapNodes(
    nodes: WorkflowNodesInterface[],
    allNodes: WorkflowNodesInterface[],
  ): WorkflowNodesInterface[] {
    return [
      ...nodes,
      ...nodes.flatMap((p) => {
        return WorkflowsService.mapNodes(
          allNodes.filter((a) => a.parentId === p.id),
          allNodes,
        );
      }),
    ];
  }

  async getNodesSteps(workflowId: string, nodeId: string) {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow || !workflow.nodes) {
      return [];
    }

    const nodes = WorkflowsService.mapNodes(
      workflow.nodes.filter((f) => f.parentId === nodeId),
      workflow.nodes,
    );

    return nodes.map((p) => ({
      ...p,
      data: JSON.parse(p.data || '{}'),
    }));
  }

  async getWorkflows(organizationId: string) {
    return this._workflowsRepository.getWorkflowsByOrganization(organizationId);
  }

  async uploadLeads(wid: string, orgId: string, urls: string[]) {
    const workflow = await this.getWorkflowAccounts(wid, orgId);
    if (!workflow) {
      return { error: 'Workflow not found or not active' };
    }

    const accounts = await Promise.all(
      workflow.children.flatMap(async (node) => {
        const data = JSON.parse(node.data || '{}');
        const bot = (await this._botsService.getBot(data.account.id))!;
        const platform = botList.find((p) => p.identifier === bot?.platform)!;
        return { bot, platform };
      }),
    );

    for (const account of accounts) {
      if (!account.platform.searchURL) {
        continue;
      }

      const matchUrl = urls.find((p) =>
        (account?.platform?.searchURL?.regex || []).some((r) => p.match(r)),
      );

      if (!matchUrl) {
        continue;
      }

      await this._temporal
        .getClient()
        .getRawClient()
        ?.workflow.start('workflowUploadLeads', {
          args: [
            { workflowId: wid, orgId, botId: account.bot.id, url: matchUrl },
          ],
          workflowId: `url-leads-${wid}-${makeId(20)}`,
          taskQueue: 'main',
          typedSearchAttributes: new TypedSearchAttributes([
            {
              key: workflowId,
              value: wid,
            },
            {
              key: organizationId,
              value: orgId,
            },
            {
              key: botId,
              value: account.bot.id,
            },
          ]),
          retry: {
            maximumAttempts: 1,
          },
        });
    }
  }

  async importURLList(workflowId: string, organizationId: string) {
    const workflow = await this.getWorkflowAccounts(workflowId, organizationId);
    if (!workflow) {
      return { error: 'Workflow not found or not active' };
    }

    const accounts = await Promise.all(
      workflow.children.flatMap((node) => {
        const data = JSON.parse(node.data || '{}');
        return this._botsService.getBot(data.account.id);
      }),
    );

    const platforms = uniq(
      accounts.map((p) => p?.platform).filter((p) => p) as string[],
    );

    return platforms
      .map((platform: string) => {
        return botList.find((p) => p.identifier === platform && p.searchURL)!;
      })
      .filter((p) => p)
      .map((p) => {
        return {
          name: p.label,
          identifier: p.identifier,
          searchURL: {
            description: p.searchURL?.description,
            regex: p.searchURL?.regex.map((p) => ({
              source: p.source,
              flag: p.flags,
            })),
          },
        };
      });
  }

  async getWorkflowAccounts(workflowId: string, organizationId?: string) {
    return this._workflowsRepository.getWorkflowAccounts(
      workflowId,
      organizationId,
    );
  }

  async getWorkflow(id: string, organizationId?: string) {
    return this._workflowsRepository.getWorkflowById(id, organizationId);
  }

  async createWorkflow(organizationId: string, name: string) {
    return this._workflowsRepository.createWorkflow(organizationId, name);
  }

  async updateWorkflow(
    id: string,
    organizationId: string,
    data: UpdateWorkflow,
  ) {
    const botsNodes = await this._workflowsRepository.getWorkflowAccounts(id);
    const botIds =
      botsNodes?.children?.flatMap(
        (p) => (JSON.parse(p.data || '{}')?.account?.id as string) || [],
      ) || [];

    const list = await this._workflowsRepository.updateWorkflow(
      id,
      organizationId,
      data,
    );

    try {
      for (const bot of botIds) {
        const workflows = this._temporal
          .getClient()
          .listWorkflows(
            `botId="${bot}" AND WorkflowType="userWorkflowThrottler" AND ExecutionStatus="Running"`,
          );

        for await (const workflow of workflows) {
          for (const del of list.toDelete) {
            try {
              await (
                await this._temporal
                  .getClient()
                  .getWorkflowHandle(workflow.workflowId)
              ).signal('removeNodesFromQueueByNodeIdSignal', del.id);
            } catch (err) {}
          }
        }
      }
    } catch (err) {}

    return list;
  }

  async deleteWorkflow(id: string, organizationId: string) {
    const botsNodes = await this._workflowsRepository.getWorkflowAccounts(id);
    const botIds =
      botsNodes?.children?.flatMap(
        (p) => (JSON.parse(p.data || '{}')?.account?.id as string) || [],
      ) || [];

    const workflow = await this._workflowsRepository.deleteWorkflow(
      id,
      organizationId,
    );

    if (botIds.length) {
      for (const bot of botIds) {
        try {
          const workflows = this._temporal
            .getClient()
            .listWorkflows(
              `botId="${bot}" AND WorkflowType="userWorkflowThrottler" AND ExecutionStatus="Running"`,
            );

          for await (const workflow of workflows) {
            try {
              await (
                await this._temporal
                  .getClient()
                  .getWorkflowHandle(workflow.workflowId)
              ).signal('removeNodesFromQueueByWorkflowIdSignal', id);
            } catch (error) {
              console.log(
                `Failed to terminate workflow ${workflow.workflowId}:`,
                error.message,
              );
            }
          }
        } catch (err) {}
      }
    }

    try {
      const workflows = this._temporal
        .getClient()
        .listWorkflows(`workflowId="${id}" AND ExecutionStatus="Running"`);
      for await (const workflow of workflows) {
        try {
          await (
            await this._temporal
              .getClient()
              .getWorkflowHandle(workflow.workflowId)
          ).terminate('Workflow deleted');
        } catch (error) {
          console.log(
            `Failed to terminate workflow ${workflow.workflowId}:`,
            error.message,
          );
        }
      }
    } catch (err) {}

    return workflow;
  }

  async getWorkflowsCount(organizationId: string) {
    return this._workflowsRepository.getWorkflowsCount(organizationId);
  }

  async getActiveWorkflowsCount(organizationId: string) {
    return this._workflowsRepository.getActiveWorkflowsCount(organizationId);
  }

  async getDashboardStats(organizationId: string) {
    const [totalWorkflows, activeWorkflows] = await Promise.all([
      this.getWorkflowsCount(organizationId),
      this.getActiveWorkflowsCount(organizationId),
    ]);

    return {
      totalWorkflows,
      activeWorkflows,
      pausedWorkflows: totalWorkflows - activeWorkflows,
    };
  }

  async changeWorkflowActivity(
    id: string,
    organizationId: string,
    active: boolean,
  ) {
    return this._workflowsRepository.changeWorkflowActivity(
      id,
      organizationId,
      active,
    );
  }

  async startBotWorkflow(
    orgId: string,
    workflowId: string,
    body: EnrichmentDto,
  ) {
    await this._temporal
      .getClient()
      .getRawClient()
      ?.workflow.start('workflowCampaign', {
        args: [{ workflowId, body, orgId }],
        workflowId: `campaign-${workflowId}-${makeId(20)}`,
        taskQueue: 'main',
        typedSearchAttributes: new TypedSearchAttributes([
          {
            key: organizationId,
            value: orgId,
          },
        ]),
        retry: {
          maximumAttempts: 1,
        },
      });
    // try {
    //   await this._temporal.startWorkflow('userActionThrottler', [], {
    //     workflowId: 'user-throttler-' + botId,
    //     taskQueue: 'main',
    //     workflowIdReusePolicy: WorkflowIdReusePolicy.REJECT_DUPLICATE,
    //     retry: {
    //       maximumAttempts: 1,
    //     },
    //   });
    // } catch (err) {}
  }
}
