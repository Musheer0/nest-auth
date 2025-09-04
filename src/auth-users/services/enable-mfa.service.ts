import { PrismaClient } from "@prisma/client";
import { GetSessionById } from "src/utils/others/get-session";
import { GetUserById } from "./get-user-by-id.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { cacheUser } from "src/utils/redis/cache-user";
export const EnabledMfa = async(prisma:PrismaClient ,token:string,user_id:string)=>{
    const session = await GetSessionById(prisma,token,user_id);
    const user = await GetUserById(prisma,session.user_id)
    if(!user) throw new NotFoundException("user not found");
    if(user.mfa_enabled) throw  new BadRequestException("mfa already enabled")
    const updated_user = await prisma.user.update({where:{
        id:user.id},
    data:{
        mfa_enabled:true,
        mfa_enabled_at:new Date()
    }
    });
    cacheUser(updated_user)
    const {mfa_enabled,mfa_enabled_at} =updated_user
    return {
        mfa_enabled,
        mfa_enabled_at
    }
}