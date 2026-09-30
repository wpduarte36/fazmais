import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { resolverTenantAlvo } from '../common/tenant-alvo.util';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
// MASTER entra pelo "Acessar como admin" (aba Municípios), informando o
// município via ?tenantId= — ver resolverTenantAlvo.
@Roles('ADMIN', 'MASTER')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload, @Query('tenantId') tenantId?: string) {
    return this.usersService.list(await resolverTenantAlvo(this.prisma, user, tenantId));
  }

  @Get('stats')
  async stats(@CurrentUser() user: JwtPayload, @Query('tenantId') tenantId?: string) {
    return this.usersService.stats(await resolverTenantAlvo(this.prisma, user, tenantId));
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateUserDto,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.usersService.create(await resolverTenantAlvo(this.prisma, user, tenantId), dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.usersService.update(await resolverTenantAlvo(this.prisma, user, tenantId), user.sub, id, dto);
  }

  @Post(':id/reset-password')
  async resetPassword(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.usersService.resetPassword(await resolverTenantAlvo(this.prisma, user, tenantId), id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.usersService.remove(await resolverTenantAlvo(this.prisma, user, tenantId), user.sub, id);
  }
}
