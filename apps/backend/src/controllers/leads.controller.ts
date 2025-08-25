import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import type { Organization } from '@prisma/client';
import { LeadsService } from '@growchief/shared-backend/database/leads/leads.service';
import { SubscriptionRequired } from '@growchief/shared-backend/billing/billing.guard';

@SubscriptionRequired()
@Controller('/leads')
export class LeadsController {
  constructor(private _leadsService: LeadsService) {}
  @Get('/')
  @HttpCode(200)
  getAnalytics(
    @Query('page') pageNumber: string,
    @GetOrganizationFromRequest() org: Organization,
  ) {
    return this._leadsService.getOrganizationLeads(org.id, +pageNumber);
  }
}
