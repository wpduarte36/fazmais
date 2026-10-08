import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  // null = marca padrão (FazMais); ausente = não mexe.
  @IsOptional()
  @IsUUID()
  marcaId?: string | null;
}
