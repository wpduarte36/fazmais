import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { TenantCatalogosService } from './tenant-catalogos.service';

@Controller('tenant-catalogos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class TenantCatalogosController {
  constructor(private readonly tenantCatalogosService: TenantCatalogosService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.tenantCatalogosService.listDisponiveis(user.tenantId as string);
  }

  @Post(':catalogoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  ativar(@CurrentUser() user: JwtPayload, @Param('catalogoId', ParseUUIDPipe) catalogoId: string) {
    return this.tenantCatalogosService.ativar(user.tenantId as string, catalogoId);
  }

  @Delete(':catalogoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  desativar(@CurrentUser() user: JwtPayload, @Param('catalogoId', ParseUUIDPipe) catalogoId: string) {
    return this.tenantCatalogosService.desativar(user.tenantId as string, catalogoId);
  }
}
