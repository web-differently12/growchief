import { IsString } from 'class-validator';

export class LinkedinConnectionRequestDto {
  @IsString()
  message = '';
}
