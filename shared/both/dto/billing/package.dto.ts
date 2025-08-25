import { billingPlans } from '@growchief/shared-both/billing/billing.plans';
import { IsIn, IsDefined, IsNumber, Min } from 'class-validator';

export class PackageDto {
  @IsIn(billingPlans.map((p) => p.identifier), {
    message: 'Invalid plan selected',
  })
  @IsDefined({ message: 'Plan is required' })
  plan: string;

  @IsIn(['year', 'month'], {
    message: 'Interval must be either "year" or "month"',
  })
  @IsDefined({ message: 'Interval is required' })
  interval: 'year' | 'month';

  @IsNumber({}, { message: 'Total must be a number' })
  @Min(1, { message: 'Total must be at least 1' })
  @IsDefined({ message: 'Total is required' })
  total: number;
}
