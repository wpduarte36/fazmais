import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { UserStatus } from '@prisma/client';

const EDITABLE_STATUSES: UserStatus[] = ['ATIVO', 'INATIVO'];

export class UpdateAdminDto {
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
}
