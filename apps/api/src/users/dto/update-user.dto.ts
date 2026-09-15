import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { UserStatus } from '@prisma/client';

const EDITABLE_STATUSES: UserStatus[] = ['ATIVO', 'INATIVO'];

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @IsOptional()
  @IsIn(EDITABLE_STATUSES)
  status?: UserStatus;

  // nulo = remove o plano (raro; normalmente só pra ADMIN, que não consome
  // conteúdo por plano mesmo). undefined = não mexe.
  @IsOptional()
  @IsString()
  planoId?: string | null;
}
