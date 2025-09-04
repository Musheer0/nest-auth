import { PrismaClient } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";

export const GetUserInfoBySession = async (
  prisma: PrismaClient,
  session_id: string
) => {
  if (!session_id) throw new BadRequestException("Session ID required");

  // 1️⃣ Fetch session with user
  const session = await prisma.session.findUnique({
    where: { id: session_id },
    include: { user: true },
  });

  if (!session) throw new BadRequestException("Invalid session");
  if (session.expires_at <= new Date()) throw new BadRequestException("Session expired");

  const user = session.user;
  if (!user) throw new BadRequestException("User not found");
  if (!user.is_email_verified) throw new BadRequestException("User email not verified");

  // 2️⃣ Return safe user info
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image_url: user.image_url,
    is_email_verified: user.is_email_verified,
    email_verified_at:user.email_verified_at,
    created_at :user.created_at,
    updated_at :user.updated_at,
    mfa_enabled:user.mfa_enabled,
    mfa_enabled_at:user.mfa_enabled_at

  };
};
