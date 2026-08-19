import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EixosService } from './eixos.service';
import { ColecoesService } from './colecoes.service';
import { EixoDto } from './dto/eixo.dto';
import { NameOnlyDto } from './dto/name-only.dto';

@Controller('eixos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class EixosController {
  constructor(
    private readonly eixosService: EixosService,
    private readonly colecoesService: ColecoesService,
  ) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: EixoDto) {
    return this.eixosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.eixosService.remove(id);
  }

  @Post(':id/colecoes')
  createColecao(@Param('id') eixoId: string, @Body() dto: NameOnlyDto) {
    return this.colecoesService.create(eixoId, dto);
  }
}
