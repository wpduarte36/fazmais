import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderColecoesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  colecaoIds: string[];
}
