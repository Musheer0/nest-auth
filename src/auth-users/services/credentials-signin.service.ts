import { PrismaClient } from "@prisma/client";
import { CredentialsSignInDto } from "../dto/sign-in/credentials-sign-in.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { verify } from "argon2";
import { UserMetaData } from "src/utils/types/user-metadata";
import { fifteenDaysFromNow } from "src/utils/others/date-utils";
import { cacheUser } from "src/utils/redis/cache-user";

export const CrendentialsSignIn = async(prisma:PrismaClient,data:CredentialsSignInDto,metadata:UserMetaData)=>{
    const user =await prisma.user.findUnique({
        where:{
            email:data.email
        }
    });
    if(!metadata.ip||!metadata.user_agent) throw new BadRequestException("invalid request")
    if(!user||!user.hashed_password) throw new BadRequestException("invalid credentials")
    const isCorrectPassword = await verify(user.hashed_password,data.password)
    if(!isCorrectPassword)  throw new BadRequestException("invalid credentials")
    //mfa is not yet implemented
    const isMfaEnabled = false;
    if(!isMfaEnabled){
     const session = await prisma.session.create({
        data:{
            user_id:user.id,
            ip:metadata.ip,
            user_agent:metadata.user_agent,
            expires_at:fifteenDaysFromNow()
        }
     });
     await cacheUser(user)
     return {
        session,
        mfa_token:null,
        mfa_enabled:false
     }
    }
    return {
        session:null,
          mfa_token:'',
        mfa_enabled:true
    }
}