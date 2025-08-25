import { Injectable } from '@nestjs/common';
import { LeadsRepository } from '@growchief/shared-backend/database/leads/leads.repository';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import { EnrichmentReturn } from '@growchief/shared-backend/enrichment/enrichment.interface';

@Injectable()
export class LeadsService {
  constructor(private _leadsRepository: LeadsRepository) {}

  async createLead(
    organizationId: string,
    workflowId: string,
    platform: string,
    leadData: EnrichmentReturn & EnrichmentDto,
  ) {
    return this._leadsRepository.createLead(
      organizationId,
      workflowId,
      platform,
      leadData,
    );
  }

  async getOrganizationLeads(orgId: string, pageNumber: number) {
    return this._leadsRepository.getOrganizationLeads(orgId, pageNumber);
  }

  async updateLead(id: string, leadData: Omit<EnrichmentReturn, 'url'>) {
    return this._leadsRepository.updateLead(id, leadData);
  }

  async addLeadToWorkflow(
    organizationId: string,
    workflowId: string,
    leadId: string,
  ) {
    return this._leadsRepository.addLeadToWorkflow(
      organizationId,
      workflowId,
      leadId,
    );
  }

  async getLead(
    platform: string,
    organizationId: string,
    workflowId: string,
    body: EnrichmentDto,
  ) {
    const lead = await this._leadsRepository.getLeadsByInformation(
      platform,
      body,
    );
    if (lead) {
      await this.addLeadToWorkflow(organizationId, workflowId, lead.id);
      return lead;
    }
  }
}
