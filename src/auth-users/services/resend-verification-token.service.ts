import { BadRequestException } from '@nestjs/common';
import { PrismaClient, user } from '@prisma/client';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { GetUserById } from './get-user-by-id.service';
import { GenerateOtpSecret } from 'src/utils/others/encrypt-secret';
import { fifteenMinsFromNow } from 'src/utils/others/date-utils';
import { GetUserByEmail } from './get-user-by-email.service';
import { SendEmail } from 'src/utils/emails/send-email';
import { generateOtpEmail } from 'src/utils/emails/templates/otp-template';

export const ResendEmailVerificationToken = async (
  prisma: PrismaClient,
  metadata: UserMetaData,
  token?: string,
  user_id?: string,
  email?: string,
) => {
  if (!metadata.ip || !metadata.user_agent)
    throw new BadRequestException('invalid request');
  let user: user | null = null;
  if (token && user_id) {
    const old_token = await prisma.verification_token.findFirst({
      where: {
        id: token,
        user_id,
      },
    });
    if (
      old_token &&
      old_token.created_at > new Date(Date.now() - 5 * 60 * 1000)
    ) {
      throw new BadRequestException(
        'please wait 5 mins before requesting again',
      );
    }
    await prisma.verification_token.deleteMany({
      where: {
        id: token,
      },
    });
    user = await GetUserById(prisma, user_id);
  }
  if (!token && !user_id && email) {
    user = await GetUserByEmail(prisma, email);
  }
  if (!user) throw new BadRequestException('user not found');
  if (!user?.email) throw new BadRequestException('email not enabled');
  if (user?.is_email_verified)
    throw new BadRequestException('email already verified');
  await prisma.verification_token.deleteMany({
    where: {
      user_id: user.id,
      scope: 'VERIFICATION',
    },
  });

  const otp_token = await GenerateOtpSecret();

  const new_token = await prisma.verification_token.create({
    data: {
      user_id: user.id,
      secret: otp_token.secret,
      ip: metadata.ip,
      user_agent: metadata.user_agent,
      expires_at: fifteenMinsFromNow(),
    },
  });
  await SendEmail({
    to: user.email,
    html: generateOtpEmail(user.email, otp_token.token),
    title: 'Verify your email',
  });
  return {
    token: new_token.id,
    user_id: new_token.user_id,
    email_verified: false,
  };
};
