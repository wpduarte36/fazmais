import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
