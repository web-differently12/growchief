import { ApolloEnrichment } from '@growchief/shared-backend/enrichment/providers/apollo.enrichment';
import { DatagmaEnrichment } from '@growchief/shared-backend/enrichment/providers/datagma.enrichment';
import { EnrichmentInterface } from '@growchief/shared-backend/enrichment/enrichment.interface';
import { RocketReachEnrichment } from '@growchief/shared-backend/enrichment/providers/rocket.reach.enrichment';

export const providerList = [
  new RocketReachEnrichment(),
  new ApolloEnrichment(),
  new DatagmaEnrichment(),
].sort((a, b) => a.priority - b.priority) as EnrichmentInterface[];
