import { PrismaClient, user } from '@prisma/client';
import { redis } from 'src/utils/others/redis';
import { cacheUser } from 'src/utils/redis/cache-user';

export const GetUserByEmail = async (prisma: PrismaClient, email: string) => {
  const cache: user | null = await redis.get(email);
  if (cache) {
    return cache;
  }

  const exiting_user = await prisma.user.findUnique({
    where: {
      email,
      status: { not: 'BANNED' },
      is_deleted: false,
    },
  });
  if (exiting_user) {
    await cacheUser(exiting_user);
    return exiting_user;
  }
  return null;
};
