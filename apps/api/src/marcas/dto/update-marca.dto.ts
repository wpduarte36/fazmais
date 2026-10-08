import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateMarcaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nomeExibicao: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nomeAssistente: string;

  // null = paleta padrão (âmbar)
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'A cor deve estar no formato #RRGGBB' })
  corPrimaria: string | null;

  // null = logo padrão / nome em texto
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false }, { message: 'Logo inválido' })
  @MaxLength(500)
  logoUrl: string | null;

  // null = usa o logo como ícone da aba
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false }, { message: 'Ícone inválido' })
  @MaxLength(500)
  iconeUrl: string | null;

  // null = imagens padrão do Fabinho
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false }, { message: 'Imagem do assistente inválida' })
  @MaxLength(500)
  assistenteImagemUrl: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false }, { message: 'Avatar do assistente inválido' })
  @MaxLength(500)
  assistenteAvatarUrl: string | null;

  // Só o host, sem protocolo nem caminho: "app.plannetamais.com.br"
  @IsArray()
  @ArrayMaxSize(10)
  @Matches(/^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/, {
    each: true,
    message: 'Domínio inválido: use só o endereço, ex: app.plannetamais.com.br',
  })
  dominios: string[];
}
