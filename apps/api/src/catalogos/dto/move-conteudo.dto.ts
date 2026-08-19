import { IsUUID } from 'class-validator';

export class MoveConteudoDto {
  @IsUUID()
  colecaoId: string;
}
