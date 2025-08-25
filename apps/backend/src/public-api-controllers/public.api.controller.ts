import { Body, Controller, Param, Post } from '@nestjs/common';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import { EnrichmentManager } from '@growchief/shared-backend/enrichment/enrichment.manager';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import type { Organization } from '@prisma/client';
@Controller('/public')
export class PublicApiController {
  constructor(private readonly _enrichmentManager: EnrichmentManager) {}
  @Post('/workflow/:id')
  processCampaign(
    @GetOrganizationFromRequest() organization: Organization,
    @Param('id') id: string,
    @Body() body: EnrichmentDto,
  ) {
    return this._enrichmentManager.startWorkflow(organization.id, id, body);
  }
}
