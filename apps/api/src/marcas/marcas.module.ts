import { Module } from '@nestjs/common';
import { MarcasController } from './marcas.controller';
import { MarcasPublicoController } from './marcas-publico.controller';
import { MarcasService } from './marcas.service';

@Module({
  controllers: [MarcasPublicoController, MarcasController],
  providers: [MarcasService],
  exports: [MarcasService],
})
export class MarcasModule {}
