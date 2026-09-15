import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('master')
  getMasterStats() {
    return this.statsService.getMasterStats();
  }
}
