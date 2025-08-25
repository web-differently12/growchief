import { IsDateString, IsIn } from 'class-validator';

export class AnalyticsDto {
  @IsIn(['month', 'week'])
  type: 'month' | 'week';

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
