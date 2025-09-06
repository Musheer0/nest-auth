import { user } from '@prisma/client';
import { redis } from '../others/redis';

export const cacheUser = async (user: user) => {
  if (!user.email) return;
  await redis.set(user.email, user, { ex: 24 * 60 * 60 });
  await redis.set(user.id, user, { ex: 24 * 60 * 60 });
};
