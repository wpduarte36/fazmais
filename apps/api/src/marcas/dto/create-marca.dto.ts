import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

// Só o básico: o resto (cor, logo, imagens, endereços) se edita no card depois.
export class CreateMarcaDto {
  // Identificador estável, usado no link ?marca=<slug>; não muda depois.
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Identificador: só letras minúsculas sem acento, números e hífen (ex: planetamais)',
  })
  @MaxLength(40)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nomeExibicao: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nomeAssistente: string;
}
