import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ColecoesService } from './colecoes.service';
import { ConteudosService } from './conteudos.service';
import { NameOnlyDto } from './dto/name-only.dto';
import { CreateConteudoDto } from './dto/create-conteudo.dto';
import { ReorderConteudosDto } from './dto/reorder-conteudos.dto';

@Controller('colecoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class ColecoesController {
  constructor(
    private readonly colecoesService: ColecoesService,
    private readonly conteudosService: ConteudosService,
  ) {}

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: NameOnlyDto) {
    return this.colecoesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.colecoesService.remove(id);
  }

  @Post(':id/conteudos')
  createConteudo(
    @Param('id', ParseUUIDPipe) colecaoId: string,
    @Body() dto: CreateConteudoDto,
  ) {
    return this.conteudosService.create(colecaoId, dto);
  }

  @Patch(':id/conteudos/reorder')
  reorderConteudos(
    @Param('id', ParseUUIDPipe) colecaoId: string,
    @Body() dto: ReorderConteudosDto,
  ) {
    return this.colecoesService.reorderConteudos(colecaoId, dto);
  }
}
