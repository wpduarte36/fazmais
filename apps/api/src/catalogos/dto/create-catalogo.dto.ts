import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCatalogoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  icon: string;
}
