import { Role } from '@prisma/client';
import { IsEmail, IsIn, IsDefined } from 'class-validator';

export class InviteDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsDefined({ message: 'Email is required' })
  email: string;

  @IsIn(['USER', 'ADMIN', 'SUPERADMIN'], {
    message: 'Role must be USER, ADMIN, or SUPERADMIN',
  })
  @IsDefined({ message: 'Role is required' })
  role: Role;
}
