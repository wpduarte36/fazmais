import { createHash, randomBytes } from 'node:crypto';
import type { PasswordTokenType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export async function issuePasswordToken(
  prisma: PrismaService,
  userId: string,
  type: PasswordTokenType,
  ttlMs: number,
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: createHash('sha256').update(token).digest('hex'),
      type,
      expiresAt: new Date(Date.now() + ttlMs),
    },
  });
  return token;
}
