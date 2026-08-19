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

const MEDIA_TYPES: MediaType[] = ['VIDEO', 'PDF', 'ARTIGO'];

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
      dto.mediaType !== undefined && dto.mediaType !== 'ARTIGO',
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
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  planoIds?: string[];

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
}
