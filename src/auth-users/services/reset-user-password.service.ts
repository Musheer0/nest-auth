import { PrismaClient, VerificationTokenScope } from "@prisma/client";
import { UserMetaData } from "src/utils/types/user-metadata";
import { UserSessionToken } from "src/utils/types/user-session-token";
import { BadRequestException } from "@nestjs/common";
import { GetUserById } from "./get-user-by-id.service";
import { GenerateOtpSecret } from "src/utils/others/encrypt-secret";
import { fifteenMinsFromNow } from "src/utils/others/date-utils";
import { SendEmail } from "src/utils/emails/send-email";
import { generateOtpEmail } from "src/utils/emails/templates/otp-template";
import { cacheUser } from "src/utils/redis/cache-user";
import { hash, verify } from "argon2";
import { EditUserPasswordDto } from "../dto/edit-user/edit-user-password.dto";
import { generateNotificationEmail } from "src/utils/emails/templates/alert-email-template";

export const ResetUserPassword = async (
  prisma: PrismaClient,
  metadata: UserMetaData,
  data: EditUserPasswordDto,
  session: UserSessionToken
) => {
  const { password, tokenId, code } = data;

  if (!metadata.user_agent || !metadata.ip)
    throw new BadRequestException("Invalid request");

  // 1️⃣ Check session valid
  const current_session = await prisma.session.findFirst({where:{
    id:session.session_id,
    user_id:session.user_id
  }})
  if (!current_session||current_session.expires_at <= new Date())
    throw new BadRequestException("Session expired");

  // 2️⃣ Fetch user
  const user = await GetUserById(prisma, session.user_id);
  if (!user) throw new BadRequestException("User not found");

  // 3️⃣ If token + code provided → confirm reset
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
    if(user.email){
        await SendEmail({to:user.email,html:generateNotificationEmail({email:user.email,extraInfo:'Your password was changed if it was not you please contact us asap,also you have  been logged out of all of your devices',title:'Password changed successfully'}),title:'Password changed successfully'})
    }
    await prisma.session.deleteMany({
        where:{
            user_id:user.id
        }
    })
    await cacheUser(updatedUser);

    // delete token
    await prisma.verification_token.delete({ where: { id: vToken.id } });

    return { success: true };
  }

  // 4️⃣ Initial request: generate + send OTP
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
    to: user.email!,
    html: generateOtpEmail(user.email!, otp_token.token, "Password reset"),
    title: "Reset your password",
  });

  return { token: newToken.id, user_id: user.id };
};
