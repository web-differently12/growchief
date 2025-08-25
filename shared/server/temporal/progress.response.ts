export type RestrictionType = 'weekly' | 'permanent';

export interface ProgressResponse {
  endWorkflow: boolean;
  delay: number;
  repeatJob: boolean;
  restriction?: {
    type: RestrictionType;
    message: string;
  };
}
