export interface CreateJobOptions {
  meta: string;
  nextJob: string;
  bot: string;
  methodName: string;
  delay: number;
  skipQueue: boolean;
  priority: number;
  data?: object;
  retries?: number;
}
