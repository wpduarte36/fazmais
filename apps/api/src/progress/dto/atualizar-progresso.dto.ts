import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class AtualizarProgressoDto {
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  lastPosition?: number;
}
