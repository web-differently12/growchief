import { ArrayMinSize, IsString, ValidateIf } from 'class-validator';

export class UploadLeadsDto {
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ValidateIf((p) => !p.link || p?.link?.length === 0)
  searchUrl: string[];

  @IsString({ each: true })
  @ArrayMinSize(1)
  @ValidateIf((p) => !p.searchUrl || p?.searchUrl?.length === 0)
  link: string[];
}
