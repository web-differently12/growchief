import { IsEmail, IsString, IsUrl, ValidateIf } from 'class-validator';

export class EnrichmentDto {
  @IsString()
  @ValidateIf((o) => !o.email && !o.urls)
  organization_name: string;

  @IsString()
  @ValidateIf((o) => !o.email && !o.urls)
  firstName: string;

  @IsString()
  @ValidateIf((o) => !o.email && !o.urls)
  lastName: string;

  @IsEmail()
  @ValidateIf(
    (o) => !o.organization_name && !o.firstName && !o.lastName && !o.urls,
  )
  email: string;

  @IsUrl({}, { each: true })
  @ValidateIf(
    (o) => !o.organization_name && !o.firstName && !o.lastName && !o.email,
  )
  urls: string[];
}
