import { defineSignal } from '@temporalio/workflow';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';
import { EnrichmentReturn } from '@growchief/shared-backend/enrichment/enrichment.interface';

export const addEnrichment = defineSignal<
  [
    EnrichmentDto & {
      platform: string;
      internalWorkflowId: string;
    },
  ]
>('addEnrichment');

export const finishedEnrichment =
  defineSignal<[false | EnrichmentReturn]>('finishedEnrichment');
