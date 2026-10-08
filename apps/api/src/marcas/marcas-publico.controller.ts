import { Controller, Get, Query } from '@nestjs/common';
import { MarcasService } from './marcas.service';

// Única rota sem login do módulo, isolada aqui de propósito: a tela de login
// já sai com a marca da URL. Só expõe dados visuais (nome, cor, logo) — nada
// de tenant ou usuário. Rotas novas vão no MarcasController, que tem guard
// na classe, pra nenhuma nascer pública por descuido.
@Controller('marcas')
export class MarcasPublicoController {
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
