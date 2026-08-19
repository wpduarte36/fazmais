import {
  Body,
  Controller,
  Delete,
  Get,
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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  list() {
    return this.tenantsService.list();
  }

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Get(':id/admins')
  listAdmins(@Param('id') id: string) {
    return this.tenantsService.listAdmins(id);
  }

  @Post(':id/admins')
  createAdmin(@Param('id') id: string, @Body() dto: CreateAdminDto) {
    return this.tenantsService.createAdmin(id, dto);
  }

  @Patch(':id/admins/:userId')
  updateAdmin(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateAdminDto,
  ) {
    return this.tenantsService.updateAdmin(id, userId, dto);
  }

  @Delete(':id/admins/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAdmin(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tenantsService.removeAdmin(id, userId);
  }
}
