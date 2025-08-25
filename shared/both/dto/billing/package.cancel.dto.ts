import { IsIn, IsDefined } from 'class-validator';

export class PackageCancelDto {
  @IsIn(['cancel', 'enable'], {
    message: 'Type must be either "cancel" or "enable"',
  })
  @IsDefined({ message: 'Type is required' })
  type: 'cancel' | 'enable';
}
