import { RunEnrichment } from '@growchief/shared-backend/bots/bots.interface';

export type RestrictionType = 'weekly' | 'permanent';

export interface ProgressResponse {
  endWorkflow: boolean;
  delay: number;
  repeatJob: boolean;
  restriction?: {
    type: RestrictionType;
    message: string;
  };
  leads?: Array<RunEnrichment & { url: string }>;
}
