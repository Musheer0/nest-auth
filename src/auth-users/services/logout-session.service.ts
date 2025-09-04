import { PrismaClient } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";
import { UserSessionToken } from "src/utils/types/user-session-token";

export const LogoutCurrentSession = async (
  prisma: PrismaClient,
  session:UserSessionToken
) => {
  if (!session) throw new BadRequestException("Session ID required");

  // Delete this session
  await prisma.session.delete({
    where: { id: session.session_id,user_id:session.user_id },
  });

  return { success: true, message: "Logged out from current device" };
};

export const LogoutAllSessions = async (
  prisma: PrismaClient,
  session:UserSessionToken
) => {
  if (!session) throw new BadRequestException("User ID required");

  // Delete all sessions for this user
  await prisma.session.deleteMany({
    where: { user_id :session.user_id},
  });

  return { success: true, message: "Logged out from all devices" };
};
