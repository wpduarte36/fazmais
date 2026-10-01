import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

// Espelha AuditAcao de @fazmais/shared (a API não depende do pacote).
export const AUDIT_ACOES = [
  'ACESSO_PAINEL_ADMIN',
  'USUARIO_CRIADO',
  'USUARIO_ALTERADO',
  'USUARIO_SENHA_RESETADA',
  'USUARIO_EXCLUIDO',
  'CATALOGO_ATIVADO',
  'CATALOGO_DESATIVADO',
  'MUNICIPIO_CRIADO',
  'MUNICIPIO_ALTERADO',
  'MUNICIPIO_EXCLUIDO',
  'ADMIN_CRIADO',
  'ADMIN_ALTERADO',
  'ADMIN_EXCLUIDO',
] as const;
export type AuditAcao = (typeof AUDIT_ACOES)[number];

// Uma entrada no painel de um município a cada 30min por Master — o painel
// recarrega a lista a cada aba/ação e não faz sentido um registro por request.
const JANELA_ACESSO_MS = 30 * 60 * 1000;
const PAGINA_PADRAO = 50;
const PAGINA_MAXIMA = 200;

export const ROLE_LABEL: Record<string, string> = {
  MASTER: 'Master',
  ADMIN: 'Admin',
  PROFESSOR: 'Educador',
};

interface RegistroAuditoria {
  tenantId: string | null;
  acao: AuditAcao;
  descricao: string;
  detalhes?: Prisma.InputJsonValue;
  // Nome do município quando ele não existe mais no banco (exclusão).
  tenantNameFallback?: string;
}

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Só o Master é auditado: é quem age sobre municípios que não são o dele.
  // Chamado depois que a ação deu certo. Uma falha aqui não desfaz a ação
  // (que já foi gravada) — fica no log de erro do servidor pra investigar.
  async registrar(actor: JwtPayload, registro: RegistroAuditoria): Promise<void> {
    if (actor.role !== 'MASTER') return;
    try {
      const [autor, tenant] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: actor.sub }, select: { name: true, login: true } }),
        registro.tenantId
          ? this.prisma.tenant.findUnique({ where: { id: registro.tenantId }, select: { name: true } })
          : null,
      ]);
      await this.prisma.auditLog.create({
        data: {
          actorId: actor.sub,
          actorName: autor?.name ?? '(desconhecido)',
          actorLogin: autor?.login ?? '',
          tenantId: tenant ? registro.tenantId : null,
          tenantName: tenant?.name ?? registro.tenantNameFallback ?? null,
          acao: registro.acao,
          descricao: registro.descricao,
          detalhes: registro.detalhes,
        },
      });
    } catch (error) {
      this.logger.error(
        `Falha ao gravar auditoria (${registro.acao}, ator ${actor.sub}): ${(error as Error).message}`,
      );
    }
  }

  async registrarAcessoPainel(actor: JwtPayload, tenantId: string): Promise<void> {
    if (actor.role !== 'MASTER') return;
    const recente = await this.prisma.auditLog.findFirst({
      where: {
        actorId: actor.sub,
        tenantId,
        acao: 'ACESSO_PAINEL_ADMIN',
        createdAt: { gte: new Date(Date.now() - JANELA_ACESSO_MS) },
      },
      select: { id: true },
    });
    if (recente) return;
    await this.registrar(actor, {
      tenantId,
      acao: 'ACESSO_PAINEL_ADMIN',
      descricao: 'Entrou no Painel Admin do município ("Área do Admin")',
    });
  }

  async listar(filtro: { tenantId?: string; cursor?: string; limite?: number }) {
    const limite = Math.min(Math.max(filtro.limite ?? PAGINA_PADRAO, 1), PAGINA_MAXIMA);
    const itens = await this.prisma.auditLog.findMany({
      where: filtro.tenantId ? { tenantId: filtro.tenantId } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limite + 1,
      ...(filtro.cursor ? { cursor: { id: filtro.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        actorName: true,
        actorLogin: true,
        tenantId: true,
        tenantName: true,
        acao: true,
        descricao: true,
        detalhes: true,
        createdAt: true,
      },
    });
    const temMais = itens.length > limite;
    const pagina = temMais ? itens.slice(0, limite) : itens;
    return { itens: pagina, proximo: temMais ? pagina[pagina.length - 1].id : null };
  }
}
