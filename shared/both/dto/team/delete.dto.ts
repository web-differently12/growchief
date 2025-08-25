import { IsEmail, IsDefined } from 'class-validator';

export class DeleteDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsDefined({ message: 'Email is required' })
  email: string;
}
