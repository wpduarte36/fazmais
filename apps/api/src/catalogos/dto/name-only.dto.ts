import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Eixo e Coleção só têm `name` no schema — um DTO serve pra criar e editar os dois.
export class NameOnlyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
