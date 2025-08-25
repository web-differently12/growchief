import { IsOptional } from 'class-validator';

export class Empty {
  @IsOptional()
  empty: string;
}
