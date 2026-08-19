import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import type { MediaType } from '@prisma/client';

const MEDIA_TYPES: MediaType[] = ['VIDEO', 'PDF', 'ARTIGO'];

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

  @ValidateIf((dto: CreateConteudoDto) => dto.mediaType !== 'ARTIGO')
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
}
