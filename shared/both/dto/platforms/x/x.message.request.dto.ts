import { IsString, MinLength } from 'class-validator';

export class XMessageDto {
  @IsString()
  @MinLength(1)
  message = '';
}
