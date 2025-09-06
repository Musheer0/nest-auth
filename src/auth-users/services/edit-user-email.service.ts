import { PrismaClient } from '@prisma/client';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { EditUserEmailDto } from '../dto/edit-user/edit-email.dto';
import { BadRequestException } from '@nestjs/common';
import { UserSessionToken } from 'src/utils/types/user-session-token';
import { GenerateOtpSecret } from 'src/utils/others/encrypt-secret';
import { fifteenMinsFromNow } from 'src/utils/others/date-utils';
import { SendEmail } from 'src/utils/emails/send-email';
import { generateOtpEmail } from 'src/utils/emails/templates/otp-template';
import { cacheUser } from 'src/utils/redis/cache-user';
import { VerificationTokenScope } from '@prisma/client';
import { verify } from 'argon2';
import { GetUserById } from './get-user-by-id.service';
import { redis } from 'src/utils/others/redis';

export const EditUserEmail = async (
  prisma: PrismaClient,
  metadata: UserMetaData,
  data: EditUserEmailDto,
  session: UserSessionToken,
) => {
  const { email, tokenId: token, code } = data;

  if (!metadata.user_agent || !metadata.ip)
    throw new BadRequestException('Invalid request');

  // 1️⃣ Check session not expired (from payload)
  if (session.expires_at <= new Date())
    throw new BadRequestException('Session expired');

  // 2️⃣ Fetch user
  const user = await GetUserById(prisma, session.user_id);
  if (!user) throw new BadRequestException('User not found');

  // 3️⃣ User must have email verified before editing
  if (!user.is_email_verified)
    throw new BadRequestException('User email not verified');
  // Check if email still free
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new BadRequestException('Email already in use');
  // 4️⃣ If token + code provided → confirm email change
  if (token && code) {
    const vToken = await prisma.verification_token.findFirst({
      where: {
        id: token,
        user_id: user.id,
        scope: VerificationTokenScope.EDIT,
      },
    });

    if (!vToken) throw new BadRequestException('Invalid token');
    if (vToken.expires_at <= new Date())
      throw new BadRequestException('Token expired');
    const isValid = await verify(vToken.secret, code);
    if (!isValid) throw new BadRequestException('Invalid code');

    // Update user email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { email },
    });

    // Update cache
    if (user?.email) {
      await redis.del(user.email);
    }
    await cacheUser(updatedUser);

    // Delete used token
    await prisma.verification_token.delete({ where: { id: vToken.id } });

    return { success: true, data: { email: updatedUser.email } };
  }
  // Delete old edit tokens
  await prisma.verification_token.deleteMany({
    where: { user_id: user.id, scope: VerificationTokenScope.EDIT },
  });

  // Generate new token
  const otp_token = await GenerateOtpSecret();
  const newToken = await prisma.verification_token.create({
    data: {
      user_id: user.id,
      secret: otp_token.secret,
      ip: metadata.ip,
      user_agent: metadata.user_agent,
      scope: VerificationTokenScope.EDIT,
      expires_at: fifteenMinsFromNow(),
    },
  });

  // Send verification email
  await SendEmail({
    to: email,
    html: generateOtpEmail(email, otp_token.token),
    title: 'Verify your new email',
  });

  return { token: newToken.id, user_id: user.id, email_verified: false };
};
