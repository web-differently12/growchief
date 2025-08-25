import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Data {
  @IsString()
  label: string;
  @IsString()
  identifier: string;
  account: any;
  settings: any;
}

export class Nodes {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  position: string;

  @ValidateNested()
  @Type(() => Data)
  data: Data;

  parent: string;
}

export class UpdateWorkflow {
  @IsString()
  name: string;

  @IsBoolean()
  active: boolean;

  @ValidateNested()
  @Type(() => Nodes)
  nodes: Nodes[];
}
