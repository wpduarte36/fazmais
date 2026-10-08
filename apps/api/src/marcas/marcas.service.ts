import { Injectable } from '@nestjs/common';
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
}
