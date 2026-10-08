import { Controller, Get, Query } from '@nestjs/common';
import { MarcasService } from './marcas.service';

// Sem guard de auth de propósito: a tela de login já sai com a marca da URL.
// Só expõe dados visuais (nome, cor, logo) — nada de tenant ou usuário.
@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Get('atual')
  atual(@Query('host') host?: unknown, @Query('slug') slug?: unknown) {
    // ?host=a&host=b chega como array — ignora qualquer coisa que não seja string.
    return this.marcasService.resolver(
      typeof host === 'string' ? host.slice(0, 255) : undefined,
      typeof slug === 'string' ? slug.slice(0, 64) : undefined,
    );
  }
}
