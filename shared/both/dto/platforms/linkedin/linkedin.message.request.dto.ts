import { IsBoolean, IsString, MinLength } from 'class-validator';

export class LinkedinMessageDto {
  @IsBoolean()
  sendIfPreviousMessages = false;

  @IsString()
  @MinLength(1)
  message = '';
}
