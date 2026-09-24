import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import type { AppPlatform, MediaType } from '@prisma/client';

const MEDIA_TYPES: MediaType[] = ['VIDEO', 'PDF', 'ARTIGO', 'APP'];
const APP_PLATFORMS: AppPlatform[] = ['APP_STORE', 'PLAY_STORE', 'WEB'];

export class UpdateConteudoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  description?: string;

  @IsOptional()
  @IsIn(MEDIA_TYPES)
  mediaType?: MediaType;

  @ValidateIf(
    (dto: UpdateConteudoDto) =>
      dto.mediaType !== undefined &&
      dto.mediaType !== 'ARTIGO' &&
      dto.mediaType !== 'APP',
  )
  @IsUrl(
    { require_tld: false },
    { message: 'mediaUrl deve ser uma URL válida' },
  )
  mediaUrl?: string;

  @ValidateIf((dto: UpdateConteudoDto) => dto.mediaType === 'ARTIGO')
  @IsString()
  @IsNotEmpty()
  htmlContent?: string;

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'imageUrl deve ser uma URL válida' },
  )
  imageUrl?: string;

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'bannerImageUrl deve ser uma URL válida' },
  )
  bannerImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  // nulo = rascunho, não visível pra ninguém ainda.
  @IsOptional()
  @IsString()
  planoMinimoId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  aiSummary?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationSeconds?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  pageCount?: number;

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'downloadUrl deve ser uma URL válida' },
  )
  downloadUrl?: string;

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'externalUrl deve ser uma URL válida' },
  )
  externalUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceName?: string | null;

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'appStoreUrl deve ser uma URL válida' },
  )
  appStoreUrl?: string | null;

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'playStoreUrl deve ser uma URL válida' },
  )
  playStoreUrl?: string | null;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'webUrl deve ser uma URL válida' })
  webUrl?: string | null;

  // Onde o APP está disponível — pelo menos uma plataforma quando o tipo é
  // APP (sem isso a janela do professor não teria o que mostrar).
  @ValidateIf(
    (dto: UpdateConteudoDto) =>
      dto.mediaType === 'APP' || dto.appPlatforms !== undefined,
  )
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Marque pelo menos uma plataforma onde o app está disponível',
  })
  @IsIn(APP_PLATFORMS, { each: true })
  appPlatforms?: AppPlatform[];
}
