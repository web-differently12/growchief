import { Injectable } from '@nestjs/common';
import { LeadsService } from '@growchief/shared-backend/database/leads/leads.service';
import { WorkflowsService } from '@growchief/shared-backend/database/workflows/workflows.service';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import { providerList } from '@growchief/shared-backend/enrichment/provider.list';
import { botList } from '@growchief/shared-backend/bots/bot.list';
import { awaitedTryCatch } from '@growchief/shared-both/utils/awaited.try.catch';
import { URLService } from '@growchief/shared-both/utils/url.normalize';

@Injectable()
export class EnrichmentManager {
  constructor(
    private _leadsService: LeadsService,
    private _workflowService: WorkflowsService,
    private _urlService: URLService,
  ) {}

  async processEnrichment(
    organizationId: string,
    workflowId: string,
    platform: string,
    enrichment: EnrichmentDto,
    forceEnrichment = false,
  ) {
    const getLead = await this._leadsService.getLead(
      platform,
      organizationId,
      workflowId,
      enrichment,
    );

    if (getLead) {
      return getLead;
    }

    for (const provider of providerList.filter((f) =>
      f.supportedIdentifiers.includes(platform),
    )) {
      const tool = botList.find((p) => p.identifier === platform)!;

      if (enrichment?.urls?.length && !forceEnrichment) {
        const findUrl = enrichment.urls.find((p) => p.match(tool.urlRegex));
        if (findUrl) {
          const createdLead = await this._leadsService.createLead(
            organizationId,
            workflowId,
            platform,
            { ...enrichment, url: findUrl },
          );

          await this._leadsService.addLeadToWorkflow(
            organizationId,
            workflowId,
            createdLead.id,
          );

          return createdLead;
        }
      }

      const lead = await awaitedTryCatch(() =>
        provider.enrich(platform, enrichment),
      );

      if (!lead) {
        continue;
      }

      lead.url = this._urlService.normalizeUrlSafe(lead.url);
      if (tool.isWWW) {
        lead.url =
          lead.url.indexOf('//www.') === -1
            ? lead.url.replace('://', '://www.')
            : lead.url;
      } else {
        lead.url = lead.url.replace('://www.', '://');
      }

      const createdLead = await this._leadsService.createLead(
        organizationId,
        workflowId,
        platform,
        { ...lead, ...enrichment },
      );

      await this._leadsService.addLeadToWorkflow(
        organizationId,
        workflowId,
        createdLead.id,
      );

      return createdLead;
    }
  }

  async startWorkflow(organizationId: string, id: string, body: EnrichmentDto) {
    const getWorkflow = await this._workflowService.getWorkflow(
      id,
      organizationId,
    );
    if (!getWorkflow) {
      return {
        status: 'error',
        message: 'Workflow not found',
      };
    }

    if (!getWorkflow.active) {
      return {
        status: 'error',
        message: 'Workflow is not active',
      };
    }

    await this._workflowService.startBotWorkflow(organizationId, id, body);

    return {
      status: 'success',
      message: 'Workflow started successfully',
    };
  }
}
