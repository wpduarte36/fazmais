import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AiSuggestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  description: string;
}
