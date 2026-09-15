import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class EixoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  // HTML autoral (mesmo padrão do `htmlContent` de Artigo — sanitizado com
  // DOMPurify no frontend antes de renderizar), sem limite de tamanho.
  @IsOptional()
  @IsString()
  description?: string;
}
