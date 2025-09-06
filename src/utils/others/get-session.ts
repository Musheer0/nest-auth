import { PrismaClient, session } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { redis } from './redis';

export const GetSessionById = async (
  prisma: PrismaClient,
  sessionId: string,
  userId: string,
) => {
  const now = new Date();
  const cache: session | null = await redis.get(
    `user:session:${userId}:${sessionId}`,
  );
  if (cache) {
    if (cache.expires_at <= now) throw new NotFoundException('Session expired');
    return cache;
  }
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }, // optional, include user info if needed
  });

  if (!session) throw new NotFoundException('Session not found');
  if (session.expires_at <= now) throw new NotFoundException('Session expired');
  await redis.set(`user:session:${userId}:${sessionId}`, session, {
    ex: 24 * 60 * 60,
  });
  return session;
};
