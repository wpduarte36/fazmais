import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Prisma 7 com driver adapters (@prisma/adapter-pg) não preenche mais
// `error.meta.target` no P2002 — o nome do campo único violado vem aninhado
// em `error.meta.driverAdapterError.cause.constraint.fields`. Mantemos o
// fallback pra `target` caso isso mude de novo em versões futuras.
export function extractUniqueConstraintFields(error: Prisma.PrismaClientKnownRequestError): string[] {
  const meta = error.meta as
    | { target?: string[]; driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } } }
    | undefined;
  return meta?.driverAdapterError?.cause?.constraint?.fields ?? meta?.target ?? [];
}

export async function runUniqueCheckedWrite<T>(
  write: () => Promise<T>,
  conflictMessages: { login: string; email: string; fallback: string },
): Promise<T> {
  try {
    return await write();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const fields = extractUniqueConstraintFields(error);
      if (fields.includes('login')) {
        throw new ConflictException(conflictMessages.login);
      }
      if (fields.includes('email')) {
        throw new ConflictException(conflictMessages.email);
      }
      throw new ConflictException(conflictMessages.fallback);
    }
    throw error;
  }
}
