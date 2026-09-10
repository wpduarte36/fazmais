import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderEixosDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  eixoIds: string[];
}
