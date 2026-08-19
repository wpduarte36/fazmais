import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Coleção só tem `name` no schema. Eixo ganhou `description` (ver eixo.dto.ts).
export class NameOnlyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
