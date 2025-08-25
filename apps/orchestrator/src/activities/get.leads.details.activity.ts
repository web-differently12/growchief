import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import { EnrichmentManager } from '@growchief/shared-backend/enrichment/enrichment.manager';

@Injectable()
@Activity()
export class GetLeadsDetailsActivity {
  constructor(private _enrichmentManager: EnrichmentManager) {}
  @ActivityMethod()
  async processLeads(body: EnrichmentDto): Promise<{ finished: boolean }> {
    return { finished: true };
  }
}
