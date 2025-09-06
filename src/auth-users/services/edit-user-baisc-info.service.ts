import { BadRequestException } from '@nestjs/common';
import { PrismaClient, user } from '@prisma/client';
import { cacheUser } from 'src/utils/redis/cache-user';
import { EditUserBasicInfoDto } from '../dto/edit-user/edit-user-basic-info.dto';
import { GetUserById } from './get-user-by-id.service';

export interface EditUserBasicInfoResult {
  success: true;
  data: {
    name: string;
    image_url?: string;
  };
}

export const editUserBasicInfo = async (
  prisma: PrismaClient,
  user_id: string,
  data: EditUserBasicInfoDto,
): Promise<EditUserBasicInfoResult> => {
  const { name, image_url } = data;

  if (!name || name.trim() === '') {
    throw new BadRequestException('Name cannot be empty');
  }

  // Fetch user
  const user: user | null = await GetUserById(prisma, user_id);
  if (!user) throw new BadRequestException('User not found');
  if (!user.is_email_verified)
    throw new BadRequestException('Email not verified. Cannot update info');

  // Update DB
  const updatedUser: user = await prisma.user.update({
    where: { id: user_id },
    data: { name, ...(image_url ? { image_url } : {}) },
  });

  // Update cache
  await cacheUser(updatedUser);

  return {
    success: true,
    data: {
      name: updatedUser.name!,
      image_url: updatedUser.image_url,
    },
  };
};
