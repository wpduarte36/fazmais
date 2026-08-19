import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CatalogosService } from './catalogos.service';
import { EixosService } from './eixos.service';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';
import { EixoDto } from './dto/eixo.dto';

@Controller('catalogos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class CatalogosController {
  constructor(
    private readonly catalogosService: CatalogosService,
    private readonly eixosService: EixosService,
  ) {}

  @Get()
  list() {
    return this.catalogosService.list();
  }

  @Post()
  create(@Body() dto: CreateCatalogoDto) {
    return this.catalogosService.create(dto);
  }

  @Get(':id')
  getTree(@Param('id') id: string) {
    return this.catalogosService.getTree(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCatalogoDto) {
    return this.catalogosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.catalogosService.remove(id);
  }

  @Post(':id/eixos')
  createEixo(@Param('id') catalogoId: string, @Body() dto: EixoDto) {
    return this.eixosService.create(catalogoId, dto);
  }
}
