import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MarcasModule } from '../marcas/marcas.module';

@Module({
  imports: [MarcasModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
