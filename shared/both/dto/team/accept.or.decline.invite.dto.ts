import { IsIn, IsDefined } from 'class-validator';

export class AcceptOrDeclineInviteDto {
  @IsIn(['accept', 'decline'], {
    message: 'Action must be either "accept" or "decline"',
  })
  @IsDefined({ message: 'Action is required' })
  action: 'accept' | 'decline';
}
