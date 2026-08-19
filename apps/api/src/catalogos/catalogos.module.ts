import { Module } from '@nestjs/common';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { EixosController } from './eixos.controller';
import { EixosService } from './eixos.service';
import { ColecoesController } from './colecoes.controller';
import { ColecoesService } from './colecoes.service';
import { ConteudosController } from './conteudos.controller';
import { ConteudosService } from './conteudos.service';
import { TenantCatalogosController } from './tenant-catalogos.controller';
import { TenantCatalogosService } from './tenant-catalogos.service';

@Module({
  controllers: [
    CatalogosController,
    EixosController,
    ColecoesController,
    ConteudosController,
    TenantCatalogosController,
  ],
  providers: [
    CatalogosService,
    EixosService,
    ColecoesService,
    ConteudosService,
    TenantCatalogosService,
  ],
})
export class CatalogosModule {}
