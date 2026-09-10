import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PlanosService } from './planos.service';

@Controller('planos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER', 'ADMIN')
export class PlanosController {
  constructor(private readonly planosService: PlanosService) {}

  @Get()
  list() {
    return this.planosService.list();
  }
}
