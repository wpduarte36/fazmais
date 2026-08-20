import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { runUniqueCheckedWrite } from '../common/unique-constraint.util';
import { issuePasswordToken } from '../common/password-token.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const MANAGED_ROLES: Role[] = ['ADMIN', 'PROFESSOR'];
const FIRST_ACCESS_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Menor que o de 1º acesso — é uma ação pontual disparada pelo próprio admin,
// não faz sentido ficar válida por dias.
const RESET_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const USER_CONFLICT_MESSAGES = {
  login: 'Esse login já está em uso',
  email: 'Esse e-mail já está cadastrado neste município',
  fallback: 'Registro duplicado',
};

const USER_SELECT = {
  id: true,
  name: true,
  login: true,
  email: true,
  whatsapp: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, role: { in: MANAGED_ROLES } },
      orderBy: { name: 'asc' },
      select: USER_SELECT,
    });
  }

  async stats(tenantId: string) {
    const where = { tenantId, role: { in: MANAGED_ROLES } };
    const [total, ativos, pendentes] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, status: 'ATIVO' as const } }),
      this.prisma.user.count({ where: { ...where, status: 'PENDENTE' as const } }),
    ]);
    return { total, ativos, pendentes };
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const created = await runUniqueCheckedWrite(
      () =>
        this.prisma.user.create({
          data: {
            tenantId,
            name: dto.name,
            login: dto.login,
            email: dto.email,
            whatsapp: dto.whatsapp,
            role: dto.role,
            status: 'ATIVO',
            password: null,
          },
          select: USER_SELECT,
        }),
      USER_CONFLICT_MESSAGES,
    );

    const token = await issuePasswordToken(this.prisma, created.id, 'FIRST_ACCESS', FIRST_ACCESS_TOKEN_TTL_MS);
    this.logger.log(
      `[dev only, sem envio de e-mail] token de 1º acesso para ${created.login}: ${token}`,
    );

    return created;
  }

  async update(tenantId: string, currentUserId: string, userId: string, dto: UpdateUserDto) {
    if (dto.status !== undefined && userId === currentUserId) {
      throw new ForbiddenException('Você não pode alterar o status da sua própria conta');
    }
    await this.findUserOrThrow(tenantId, userId);
    return runUniqueCheckedWrite(
      () =>
        this.prisma.user.update({
          where: { id: userId },
          data: {
            name: dto.name,
            email: dto.email,
            whatsapp: dto.whatsapp,
            status: dto.status,
          },
          select: USER_SELECT,
        }),
      USER_CONFLICT_MESSAGES,
    );
  }

  async resetPassword(tenantId: string, userId: string) {
    await this.findUserOrThrow(tenantId, userId);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    const token = await issuePasswordToken(this.prisma, userId, 'RESET', RESET_TOKEN_TTL_MS);
    return { token, expiresAt };
  }

  async remove(tenantId: string, currentUserId: string, userId: string): Promise<void> {
    if (userId === currentUserId) {
      throw new ForbiddenException('Você não pode excluir a sua própria conta');
    }
    await this.findUserOrThrow(tenantId, userId);
    await this.prisma.user.delete({ where: { id: userId } });
  }

  private async findUserOrThrow(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, role: { in: MANAGED_ROLES } },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }
}
