import { IsNotEmpty, IsString } from 'class-validator';

export class MoveConteudoDto {
  @IsString()
  @IsNotEmpty()
  colecaoId: string;
}
