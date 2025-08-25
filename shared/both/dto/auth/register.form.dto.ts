import {
  IsEmail,
  IsString,
  IsDefined,
  MinLength,
  MaxLength,
  Validate,
  ValidatorConstraint,
} from 'class-validator';
import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MatchPasswords', async: false })
export class MatchPasswords implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return confirmPassword === relatedValue;
  }

  defaultMessage(_: ValidationArguments) {
    return 'Passwords do not match';
  }
}

export class RegisterFormDto {
  @IsString()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsDefined({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsDefined({ message: 'Password is required' })
  password: string;

  @IsString()
  @IsDefined({ message: 'Confirm password is required' })
  @Validate(MatchPasswords, ['password'])
  confirmPassword: string;

  @IsString()
  @MinLength(3, { message: 'Company name must be at least 3 characters' })
  @MaxLength(64, { message: 'Company name cannot exceed 64 characters' })
  @IsDefined({ message: 'Company name is required' })
  company: string;
}
