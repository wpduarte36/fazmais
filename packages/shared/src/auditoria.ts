// Ações do Master sobre um município que ficam na trilha de auditoria.
// Espelha AUDIT_ACOES de apps/api/src/auditoria/auditoria.service.ts.
export const AuditAcao = {
  ACESSO_PAINEL_ADMIN: 'ACESSO_PAINEL_ADMIN',
  USUARIO_CRIADO: 'USUARIO_CRIADO',
  USUARIO_ALTERADO: 'USUARIO_ALTERADO',
  USUARIO_SENHA_RESETADA: 'USUARIO_SENHA_RESETADA',
  USUARIO_EXCLUIDO: 'USUARIO_EXCLUIDO',
  CATALOGO_ATIVADO: 'CATALOGO_ATIVADO',
  CATALOGO_DESATIVADO: 'CATALOGO_DESATIVADO',
  MUNICIPIO_CRIADO: 'MUNICIPIO_CRIADO',
  MUNICIPIO_ALTERADO: 'MUNICIPIO_ALTERADO',
  MUNICIPIO_EXCLUIDO: 'MUNICIPIO_EXCLUIDO',
  ADMIN_CRIADO: 'ADMIN_CRIADO',
  ADMIN_ALTERADO: 'ADMIN_ALTERADO',
  ADMIN_EXCLUIDO: 'ADMIN_EXCLUIDO',
  MARCA_ALTERADA: 'MARCA_ALTERADA',
} as const;
export type AuditAcao = (typeof AuditAcao)[keyof typeof AuditAcao];

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorLogin: string;
  tenantId: string | null;
  tenantName: string | null;
  acao: AuditAcao;
  descricao: string;
  detalhes: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogPage {
  itens: AuditLogEntry[];
  // id do último item, pra pedir a próxima página (?cursor=); null = acabou.
  proximo: string | null;
}
