import { PrismaClient } from "@prisma/client";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { cacheUser } from "src/utils/redis/cache-user";
import { verify } from "argon2";
import { GenerateOtpSecret } from "src/utils/others/encrypt-secret";
import { fifteenMinsFromNow } from "src/utils/others/date-utils";
import { DisableMfaDto } from "../dto/disable-mfa/disable-mfa.token";
import { UserMetaData } from "src/utils/types/user-metadata";

export const DisableMfa = async (
  prisma: PrismaClient,
  userId: string,
  metadata: UserMetaData,
  data?:DisableMfaDto
) => {
    if(!metadata.ip||!metadata.user_agent) throw new BadRequestException("invalid request")
  // 1️⃣ Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException("User not found");
  if (!user.mfa_enabled) throw new BadRequestException("MFA is not enabled");

  // 2️⃣ No code submitted → generate MFA disable token
  if (!data?.code) {
    const otp = await GenerateOtpSecret(); // { secret, token }
    const verificationToken = await prisma.verification_token.create({
      data: {
        user_id: user.id,
        ip: metadata.ip,
        user_agent: metadata.user_agent,
        secret: otp.secret,
        expires_at: fifteenMinsFromNow(),
        scope: "MFA_DISABLE",
      },
    });
    //TODO send email
    console.log(otp)
    return {
      mfa_token: verificationToken.id,
    };
  }

  // 3️⃣ Code submitted → verify token
  const tokenRecord = await prisma.verification_token.findFirst({
    where: {
      user_id: user.id,
      scope: "MFA_DISABLE",
      expires_at: { gt: new Date() },
      id:data.token
    },
    orderBy: { created_at: "desc" },
  });

  if (!tokenRecord) throw new NotFoundException("MFA token not found or expired");

  const isValid = await verify(tokenRecord.secret, data.code);
  if (!isValid) throw new BadRequestException("Invalid MFA code");

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      mfa_enabled: false,
      mfa_enabled_at: null,
    },
  });

  await prisma.verification_token.delete({ where: { id: tokenRecord.id } });

  await cacheUser(updatedUser);

  return {
    mfa_enabled: updatedUser.mfa_enabled,
    mfa_enabled_at: updatedUser.mfa_enabled_at,
  };
};
