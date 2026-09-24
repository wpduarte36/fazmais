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

export const MediaType = {
  VIDEO: 'VIDEO',
  PDF: 'PDF',
  ARTIGO: 'ARTIGO',
  APP: 'APP',
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const AppPlatform = {
  APP_STORE: 'APP_STORE',
  PLAY_STORE: 'PLAY_STORE',
  WEB: 'WEB',
} as const;
export type AppPlatform = (typeof AppPlatform)[keyof typeof AppPlatform];
