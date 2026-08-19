import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes, createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

const FIRST_ACCESS_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    const adminCounts = await this.prisma.user.groupBy({
      by: ['tenantId'],
      where: { role: 'ADMIN', tenantId: { in: tenants.map((t) => t.id) } },
      _count: { _all: true },
    });
    const adminCountByTenant = new Map(
      adminCounts.map((row) => [row.tenantId, row._count._all]),
    );

    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      createdAt: tenant.createdAt,
      usersCount: tenant._count.users,
      adminsCount: adminCountByTenant.get(tenant.id) ?? 0,
    }));
  }

  async create(dto: CreateTenantDto) {
    return this.prisma.tenant.create({ data: { name: dto.name } });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findTenantOrThrow(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findTenantOrThrow(id);
    const usersCount = await this.prisma.user.count({
      where: { tenantId: id },
    });
    if (usersCount > 0) {
      throw new ConflictException(
        'Não é possível excluir um município com usuários vinculados',
      );
    }
    await this.prisma.tenant.delete({ where: { id } });
  }

  async listAdmins(tenantId: string) {
    await this.findTenantOrThrow(tenantId);
    return this.prisma.user.findMany({
      where: { tenantId, role: 'ADMIN' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        login: true,
        email: true,
        whatsapp: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async createAdmin(tenantId: string, dto: CreateAdminDto) {
    await this.findTenantOrThrow(tenantId);

    const admin = await this.runUniqueCheckedWrite(() =>
      this.prisma.user.create({
        data: {
          tenantId,
          name: dto.name,
          login: dto.login,
          email: dto.email,
          whatsapp: dto.whatsapp,
          role: 'ADMIN',
          status: 'ATIVO',
          password: null,
        },
        select: {
          id: true,
          name: true,
          login: true,
          email: true,
          whatsapp: true,
          status: true,
          createdAt: true,
        },
      }),
    );

    const firstAccessToken = await this.issueFirstAccessToken(admin.id);
    this.logger.log(
      `[dev only, sem envio de e-mail] token de 1º acesso para ${admin.login}: ${firstAccessToken}`,
    );

    return admin;
  }

  async updateAdmin(tenantId: string, userId: string, dto: UpdateAdminDto) {
    await this.findAdminOrThrow(tenantId, userId);
    return this.runUniqueCheckedWrite(() =>
      this.prisma.user.update({
        where: { id: userId },
        data: {
          name: dto.name,
          email: dto.email,
          whatsapp: dto.whatsapp,
          status: dto.status,
        },
        select: {
          id: true,
          name: true,
          login: true,
          email: true,
          whatsapp: true,
          status: true,
          createdAt: true,
        },
      }),
    );
  }

  async removeAdmin(tenantId: string, userId: string): Promise<void> {
    await this.findAdminOrThrow(tenantId, userId);
    await this.prisma.user.delete({ where: { id: userId } });
  }

  private async findTenantOrThrow(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Município não encontrado');
    }
    return tenant;
  }

  private async findAdminOrThrow(tenantId: string, userId: string) {
    const admin = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, role: 'ADMIN' },
    });
    if (!admin) {
      throw new NotFoundException('Administrador não encontrado');
    }
    return admin;
  }

  private async issueFirstAccessToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: createHash('sha256').update(token).digest('hex'),
        type: 'FIRST_ACCESS',
        expiresAt: new Date(Date.now() + FIRST_ACCESS_TOKEN_TTL_MS),
      },
    });
    return token;
  }

  private async runUniqueCheckedWrite<T>(write: () => Promise<T>): Promise<T> {
    try {
      return await write();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const fields = this.extractUniqueConstraintFields(error);
        if (fields.includes('login')) {
          throw new ConflictException('Esse login já está em uso');
        }
        if (fields.includes('email')) {
          throw new ConflictException(
            'Esse e-mail já está cadastrado neste município',
          );
        }
        throw new ConflictException('Registro duplicado');
      }
      throw error;
    }
  }

  // Prisma 7 com driver adapters (@prisma/adapter-pg) não preenche mais
  // `error.meta.target` no P2002 — o nome do campo único violado vem aninhado
  // em `error.meta.driverAdapterError.cause.constraint.fields`. Mantemos o
  // fallback pra `target` caso isso mude de novo em versões futuras.
  private extractUniqueConstraintFields(error: Prisma.PrismaClientKnownRequestError): string[] {
    const meta = error.meta as
      | { target?: string[]; driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } } }
      | undefined;
    return meta?.driverAdapterError?.cause?.constraint?.fields ?? meta?.target ?? [];
  }
}
