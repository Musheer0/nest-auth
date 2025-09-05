import { PrismaClient, VerificationTokenScope } from "@prisma/client";
import { UserMetaData } from "src/utils/types/user-metadata";
import { BadRequestException } from "@nestjs/common";
import { hash, verify } from "argon2";
import { EditUserPasswordDto } from "../dto/edit-user/edit-user-password.dto";
import { GenerateOtpSecret } from "src/utils/others/encrypt-secret";
import { fifteenMinsFromNow } from "src/utils/others/date-utils";
import { SendEmail } from "src/utils/emails/send-email";
import { generateOtpEmail } from "src/utils/emails/templates/otp-template";
import { cacheUser } from "src/utils/redis/cache-user";
import { GetUserByEmail } from "./get-user-by-email.service";

export const ResetUserPasswordUnauth = async (
  prisma: PrismaClient,
  metadata: UserMetaData,
  data: EditUserPasswordDto
) => {
  const { email, password, tokenId, code } = data;

  if (!metadata.ip || !metadata.user_agent)
    throw new BadRequestException("Invalid request");

  // 🚨 Require email
  if (!email) throw new BadRequestException("Email is required");

  // 1️⃣ Find user by email
  const user = await GetUserByEmail(prisma,email)
  if (!user) throw new BadRequestException("User not found");

  // 2️⃣ If token + code provided → confirm reset
  if (tokenId && code) {
    const vToken = await prisma.verification_token.findFirst({
      where: {
        id: tokenId,
        user_id: user.id,
        scope: VerificationTokenScope.PASSWORD,
      },
    });

    if (!vToken) throw new BadRequestException("Invalid token");
    if (vToken.expires_at <= new Date())
      throw new BadRequestException("Token expired");

    const isValid = await verify(vToken.secret, code);
    if (!isValid) throw new BadRequestException("Invalid code");

    // ✅ Update password
    const hashed_password = await hash(password);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { hashed_password },
    });

    // ❌ Kill all sessions
    await prisma.session.deleteMany({
      where: { user_id: user.id },
    });

    await cacheUser(updatedUser);

   if(user.email)
    await SendEmail({
      to: user.email,
      html: generateNotificationEmail({
        email: user.email,
        title: "Password changed successfully",
        extraInfo:
          "Your password was changed. If this wasn’t you, please contact support immediately. All your sessions have been logged out.",
      }),
      title: "Password changed successfully",
    });

    // delete token
    await prisma.verification_token.delete({ where: { id: vToken.id } });

    return { success: true };
  }

  // 3️⃣ Initial request: generate + send OTP
  await prisma.verification_token.deleteMany({
    where: { user_id: user.id, scope: VerificationTokenScope.PASSWORD },
  });

  const otp_token = await GenerateOtpSecret();
  const newToken = await prisma.verification_token.create({
    data: {
      user_id: user.id,
      secret: otp_token.secret,
      ip: metadata.ip,
      user_agent: metadata.user_agent,
      scope: VerificationTokenScope.PASSWORD,
      expires_at: fifteenMinsFromNow(),
    },
  });
if(user.email)
  await SendEmail({
    to: user.email,
    html: generateOtpEmail(user.email, otp_token.token, "Password reset"),
    title: "Reset your password",
  });

  return { token: newToken.id, user_id: user.id };
};
