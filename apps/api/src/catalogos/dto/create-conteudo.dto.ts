import {
  ArrayMaxSize,
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
import type { MediaType } from '@prisma/client';

const MEDIA_TYPES: MediaType[] = ['VIDEO', 'PDF', 'ARTIGO', 'APP'];

export class CreateConteudoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  description: string;

  @IsIn(MEDIA_TYPES)
  mediaType: MediaType;

  @ValidateIf(
    (dto: CreateConteudoDto) =>
      dto.mediaType !== 'ARTIGO' && dto.mediaType !== 'APP',
  )
  @IsUrl(
    { require_tld: false },
    { message: 'mediaUrl deve ser uma URL válida' },
  )
  mediaUrl?: string;

  @ValidateIf((dto: CreateConteudoDto) => dto.mediaType === 'ARTIGO')
  @IsString()
  @IsNotEmpty()
  htmlContent?: string;

  @IsUrl(
    { require_tld: false },
    { message: 'imageUrl deve ser uma URL válida' },
  )
  imageUrl: string;

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

  // nulo/ausente = rascunho, não visível pra ninguém ainda.
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
  externalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceName?: string;

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'appStoreUrl deve ser uma URL válida' },
  )
  appStoreUrl?: string;

  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'playStoreUrl deve ser uma URL válida' },
  )
  playStoreUrl?: string;
}
