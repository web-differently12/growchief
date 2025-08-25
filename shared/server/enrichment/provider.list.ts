import { ApolloEnrichment } from '@growchief/shared-backend/enrichment/providers/apollo.enrichment';
import { DatagmaEnrichment } from '@growchief/shared-backend/enrichment/providers/datagma.enrichment';
import { EnrichmentInterface } from '@growchief/shared-backend/enrichment/enrichment.interface';

export const providerList = [
  new DatagmaEnrichment(),
  // new ApolloEnrichment(),
].sort((a, b) => a.priority - b.priority) as EnrichmentInterface[];
