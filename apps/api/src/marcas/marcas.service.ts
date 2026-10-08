import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { PrismaService } from '../prisma/prisma.service';

// Espelha MarcaPublica/MARCA_PADRAO_SLUG de @fazmais/shared (a API não depende do pacote).
export const MARCA_PADRAO_SLUG = 'fazmais';

export interface MarcaPublica {
  slug: string;
  nomeExibicao: string;
  nomeAssistente: string;
  corPrimaria: string | null;
  logoUrl: string | null;
}

const SELECT_PUBLICO = {
  slug: true,
  nomeExibicao: true,
  nomeAssistente: true,
  corPrimaria: true,
  logoUrl: true,
} as const;

// Fallback se nem a marca padrão existir no banco (ex: migration ainda não
// aplicada) — o app nunca fica sem marca.
const MARCA_PADRAO_FIXA: MarcaPublica = {
  slug: MARCA_PADRAO_SLUG,
  nomeExibicao: 'FazMais',
  nomeAssistente: 'Fabinho',
  corPrimaria: null,
  logoUrl: null,
};

// "App.PlannetaMais.com.br:443" -> "app.plannetamais.com.br"
function normalizarHost(host: string): string {
  return host.trim().toLowerCase().replace(/:\d+$/, '');
}

@Injectable()
export class MarcasService {
  constructor(private readonly prisma: PrismaService) {}

  // Ordem: slug explícito (simulação em dev/homologação) > domínio > padrão.
  async resolver(host?: string, slug?: string): Promise<MarcaPublica> {
    if (slug) {
      const marca = await this.prisma.marca.findUnique({ where: { slug }, select: SELECT_PUBLICO });
      if (marca) return marca;
    }
    if (host) {
      const marca = await this.prisma.marca.findFirst({
        where: { dominios: { has: normalizarHost(host) } },
        select: SELECT_PUBLICO,
      });
      if (marca) return marca;
    }
    const padrao = await this.prisma.marca.findUnique({ where: { slug: MARCA_PADRAO_SLUG }, select: SELECT_PUBLICO });
    return padrao ?? MARCA_PADRAO_FIXA;
  }

  async listar() {
    const marcas = await this.prisma.marca.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { tenants: true } } },
    });
    return marcas.map(({ _count, createdAt: _c, updatedAt: _u, ...marca }) => ({
      ...marca,
      tenantsCount: _count.tenants,
    }));
  }

  async atualizar(id: string, dto: UpdateMarcaDto) {
    const anterior = await this.prisma.marca.findUnique({ where: { id } });
    if (!anterior) throw new NotFoundException('Empresa não encontrada');

    const dominios = [...new Set(dto.dominios.map(normalizarHost))];
    if (dominios.length > 0) {
      const emUso = await this.prisma.marca.findFirst({
        where: { id: { not: id }, dominios: { hasSome: dominios } },
        select: { nomeExibicao: true, dominios: true },
      });
      if (emUso) {
        const repetido = dominios.find((d) => emUso.dominios.includes(d));
        throw new ConflictException(`O domínio ${repetido} já está na empresa ${emUso.nomeExibicao}`);
      }
    }

    const atualizada = await this.prisma.marca.update({
      where: { id },
      data: {
        nomeExibicao: dto.nomeExibicao.trim(),
        nomeAssistente: dto.nomeAssistente.trim(),
        corPrimaria: dto.corPrimaria ? dto.corPrimaria.toLowerCase() : null,
        logoUrl: dto.logoUrl || null,
        dominios,
      },
    });
    return { anterior, atualizada };
  }

  // Endereço público da marca do tenant (1º domínio), pros links de definir
  // senha. Nulo se o tenant não tem marca ou a marca não tem domínio.
  async appUrlDoTenant(tenantId: string): Promise<string | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { marca: { select: { dominios: true } } },
    });
    const dominio = tenant?.marca?.dominios[0];
    return dominio ? `https://${dominio}` : null;
  }
}
