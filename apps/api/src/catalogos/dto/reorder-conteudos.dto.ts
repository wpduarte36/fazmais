import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderConteudosDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  conteudoIds: string[];
}
