import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { AnalyticsDto } from '@growchief/shared-both/dto/analytics/analytics.dto';
import { AnalyticsService } from '@growchief/shared-backend/database/analytics/analytics.service';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import type { Organization } from '@prisma/client';
import { SubscriptionRequired } from '@growchief/shared-backend/billing/billing.guard';
@SubscriptionRequired()
@Controller('/analytics')
export class AnalyticsController {
  constructor(private _analyticsService: AnalyticsService) {}
  @Get('/')
  @HttpCode(200)
  getAnalytics(
    @Query() analytics: AnalyticsDto,
    @GetOrganizationFromRequest() org: Organization,
  ) {
    return this._analyticsService.getAnalytics(org.id, analytics);
  }
}
