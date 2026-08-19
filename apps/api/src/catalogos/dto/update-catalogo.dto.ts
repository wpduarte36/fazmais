import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCatalogoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  icon?: string;
}
