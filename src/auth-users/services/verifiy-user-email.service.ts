import { PrismaClient } from "@prisma/client"
import { GetVerificationTokenByUserId } from "./get-verification-token.service"
import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { Verify } from "src/utils/others/encrypt-secret";
import { UserMetaData } from "src/utils/types/user-metadata";
import { fifteenDaysFromNow } from "src/utils/others/date-utils";
import { redis } from "src/utils/others/redis";
import { cacheUser } from "src/utils/redis/cache-user";

export const VerifyUserEmailAndLogin = async(prisma:PrismaClient, userId:string,tokenId:string, code:string,metaData:UserMetaData)=>{
    if(!metaData.ip||!metaData.user_agent) throw new BadRequestException("invalid request")
    const user = await prisma.user.findUnique({where:{
        id:userId
    },select:{id:true}})
    if(!user) throw new NotFoundException("invalid code")
    const verification_token = await GetVerificationTokenByUserId(
        prisma,
        tokenId,
        userId
    );
    if(!verification_token) throw new NotFoundException("invalid code or code expired");
    if(verification_token.scope!=='VERIFICATION') throw new UnauthorizedException("un-authorized token")
        console.log(verification_token)
    const isValidToken=await Verify(code,verification_token.secret)
    if(!isValidToken) throw new NotFoundException("invalid code ")
    await prisma.verification_token.delete({where:{id:tokenId}});
    const updated_user = await prisma.user.update({
        where:{id:user.id},
        data:{is_email_verified:true,email_verified_at:new Date()}
    })
    const session_token = await prisma.session.create({
        data:{
            user_id:verification_token.user_id,
            ip:metaData.ip,
            user_agent:metaData.user_agent,
            expires_at:fifteenDaysFromNow()
        }
    });
    await cacheUser(updated_user)
    await redis.set(`user:session:${verification_token.user_id}:${session_token.id}`,session_token);
    return session_token
}