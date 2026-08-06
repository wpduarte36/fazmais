export const Role = {
  MASTER: 'MASTER',
  ADMIN: 'ADMIN',
  PROFESSOR: 'PROFESSOR',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  PENDENTE: 'PENDENTE',
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
