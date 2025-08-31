import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import type { Organization } from '@prisma/client';
import { WorkflowsService } from '@growchief/shared-backend/database/workflows/workflows.service';
@Controller('/public')
export class PublicApiController {
  constructor(private readonly _workflowService: WorkflowsService) {}
  @Post('/workflow/:id')
  processCampaign(
    @GetOrganizationFromRequest() organization: Organization,
    @Param('id') id: string,
    @Body() body: EnrichmentDto,
  ) {
    return this._workflowService.startWorkflow(organization.id, id, body);
  }

  @Get('/workflows')
  getWorkflows(@GetOrganizationFromRequest() organization: Organization) {
    return this._workflowService.getWorkflows(organization.id);
  }

  @Get('/is-connected')
  isConnected(@GetOrganizationFromRequest() organization: Organization) {
    return { connected: !!organization };
  }
}
