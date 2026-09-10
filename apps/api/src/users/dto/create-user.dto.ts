import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const CREATABLE_ROLES = ['ADMIN', 'PROFESSOR'] as const;

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  login: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @IsIn(CREATABLE_ROLES)
  role: 'ADMIN' | 'PROFESSOR';

  // só faz sentido pra PROFESSOR — ADMIN não consome conteúdo por plano.
  @IsOptional()
  @IsString()
  planoId?: string;
}
