import { IsDefined, IsString } from 'class-validator';

export class CreateProxyDto {
  @IsString()
  @IsDefined()
  country: string;
}
