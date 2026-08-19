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
import { ConteudosService } from './conteudos.service';
import { UpdateConteudoDto } from './dto/update-conteudo.dto';
import { MoveConteudoDto } from './dto/move-conteudo.dto';
import { AiSuggestDto } from './dto/ai-suggest.dto';

@Controller('conteudos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class ConteudosController {
  constructor(private readonly conteudosService: ConteudosService) {}

  @Post('ai-suggestions')
  aiSuggest(@Body() dto: AiSuggestDto) {
    return this.conteudosService.aiSuggest(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConteudoDto) {
    return this.conteudosService.update(id, dto);
  }

  @Patch(':id/move')
  move(@Param('id') id: string, @Body() dto: MoveConteudoDto) {
    return this.conteudosService.move(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.conteudosService.remove(id);
  }
}
