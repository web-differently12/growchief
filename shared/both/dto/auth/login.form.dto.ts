import { IsEmail, IsString, IsDefined, MinLength } from 'class-validator';

export class LoginFormDto {
  @IsString()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsDefined({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsDefined({ message: 'Password is required' })
  password: string;
}
