import { PrismaClient } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";
import { UserSessionToken } from "src/utils/types/user-session-token";
import { redis } from "src/utils/others/redis";
import { fifteenDaysFromNow } from "src/utils/others/date-utils";
import { GetJwtPayloadFromSession } from "src/utils/others/get-jwt-payload-from-session";

export const RefreshSession = async (
  prisma: PrismaClient,
  session:UserSessionToken
) => {
  if (!session) throw new BadRequestException("Session ID required");
  const updated_session = await prisma.session.update({
    where:{
        user_id:session.user_id,
        id:session.user_id,
        expires_at:{gt:new Date()}
    },
    data:{
        expires_at:fifteenDaysFromNow()
    }
  });
  if(!updated_session) throw new BadRequestException("session not found or expired")
  return updated_session
};
