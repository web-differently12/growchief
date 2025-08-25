import { IsDefined, IsString } from 'class-validator';

export class DeleteProxyDto {
  @IsString()
  @IsDefined()
  ip: string;
}
