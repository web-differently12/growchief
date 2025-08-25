import {
  IsString,
  IsDefined,
  MinLength,
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
    return 'Passwords must match';
  }
}

export class ResetPasswordFormDto {
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsDefined({ message: 'Password is required' })
  password: string;

  @IsString()
  @IsDefined({ message: 'Please confirm your password' })
  @Validate(MatchPasswords, ['password'])
  confirmPassword: string;
}
