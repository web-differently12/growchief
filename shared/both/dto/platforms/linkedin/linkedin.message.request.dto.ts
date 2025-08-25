import { IsString, MinLength } from 'class-validator';

export class LinkedinMessageDto {
  @IsString()
  @MinLength(1)
  message = '';
}
