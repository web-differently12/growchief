import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';

@Injectable()
@Activity()
export class GetLeadsDetailsActivity {
  @ActivityMethod()
  async processLeads(body: EnrichmentDto): Promise<{ finished: boolean }> {
    return { finished: true };
  }
}
