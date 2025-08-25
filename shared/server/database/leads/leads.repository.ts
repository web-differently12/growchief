import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@growchief/shared-backend/database/prisma';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import { EnrichmentReturn } from '@growchief/shared-backend/enrichment/enrichment.interface';

@Injectable()
export class LeadsRepository {
  constructor(
    private _leads: PrismaRepository<'leads'>,
    private _leadsOrganization: PrismaRepository<'leadsOrganization'>,
  ) {}

  updateLead(id: string, leadData: Omit<EnrichmentReturn, 'url'>) {
    return this._leads.model.leads.update({
      where: {
        id,
      },
      data: {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        picture: leadData.picture,
      },
    });
  }

  async getOrganizationLeads(orgId: string, pageNumber: number) {
    const pageSize = 10; // Define the number of leads per page
    const skip = (pageNumber - 1) * pageSize; // Calculate the number of leads to skip

    // First, get distinct lead IDs with pagination
    const distinctLeadIds =
      await this._leadsOrganization.model.leadsOrganization.findMany({
        where: {
          organizationId: orgId,
        },
        select: {
          leadId: true,
          createdAt: true,
        },
        distinct: ['leadId'],
        orderBy: {
          createdAt: 'desc' as const,
        },
        skip,
        take: pageSize,
      });

    // Get the total count of distinct leads
    const distinctLeadsCount =
      await this._leadsOrganization.model.leadsOrganization.findMany({
        where: {
          organizationId: orgId,
        },
        select: {
          leadId: true,
        },
        distinct: ['leadId'],
      });

    if (distinctLeadIds.length === 0) {
      return {
        leads: [],
        count: 0,
      };
    }

    // Get full lead data with all associated workflows
    const leadsWithWorkflows =
      await this._leadsOrganization.model.leadsOrganization.findMany({
        where: {
          organizationId: orgId,
          leadId: {
            in: distinctLeadIds.map((item) => item.leadId),
          },
        },
        select: {
          lead: true,
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc' as const,
        },
      });

    // Group workflows by lead
    const groupedLeads = new Map();

    leadsWithWorkflows.forEach((item) => {
      const leadId = item.lead.id;

      if (!groupedLeads.has(leadId)) {
        groupedLeads.set(leadId, {
          lead: item.lead,
          workflows: [],
          createdAt: item.createdAt,
        });
      }

      groupedLeads.get(leadId).workflows.push(item.workflow);
    });

    // Convert map to array and sort by creation date
    const leads = Array.from(groupedLeads.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      leads,
      count: distinctLeadsCount.length,
    };
  }

  async createLead(
    organizationId: string,
    workflowId: string,
    platform: string,
    leadData: EnrichmentReturn & EnrichmentDto,
  ) {
    return this._leads.model.leads.upsert({
      where: {
        platform_url: {
          url: leadData.url,
          platform,
        },
      },
      create: {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        url: leadData.url,
        organization_name: leadData.organization_name,
        platform,
      },
      update: {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        url: leadData.url,
        organization_name: leadData.organization_name,
        platform,
      },
    });
  }

  async addLeadToWorkflow(
    organizationId: string,
    workflowId: string,
    leadId: string,
  ) {
    return this._leadsOrganization.model.leadsOrganization.upsert({
      where: {
        organizationId_leadId_workflowId: {
          organizationId,
          leadId,
          workflowId,
        },
      },
      create: {
        organizationId,
        leadId,
        workflowId,
      },
      update: {
        organizationId,
        leadId,
        workflowId,
      },
    });
  }

  async getLeadsByInformation(platform: string, enrichment: EnrichmentDto) {
    if (enrichment?.urls?.length) {
      return this._leads.model.leads.findFirst({
        where: {
          OR: enrichment.urls.map((p) => ({
            url: p.split('?')[0],
          })),
        },
      });
    }

    if (enrichment.email) {
      return this._leads.model.leads.findFirst({
        where: {
          platform,
          email: enrichment.email,
        },
      });
    }

    return this._leads.model.leads.findFirst({
      where: {
        platform,
        firstName: enrichment.firstName,
        lastName: enrichment.lastName,
        organization_name: enrichment.organization_name,
      },
    });
  }
}
