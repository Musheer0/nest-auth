import { PrismaClient } from "@prisma/client";
import { CredentialsSignInDto } from "../dto/sign-in/credentials-sign-in.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { verify } from "argon2";
import { UserMetaData } from "src/utils/types/user-metadata";
import { fifteenDaysFromNow, fifteenMinsFromNow } from "src/utils/others/date-utils";
import { cacheUser } from "src/utils/redis/cache-user";
import { GenerateOtpSecret, Verify } from "src/utils/others/encrypt-secret";
import { SendEmail } from "src/utils/emails/send-email";
import { generateOtpEmail } from "src/utils/emails/templates/otp-template";

export const CrendentialsSignIn = async(prisma:PrismaClient,data:CredentialsSignInDto,metadata:UserMetaData)=>{
      if(data?.code?.length<6){
            throw new BadRequestException("invalid code")
        }
    const user =await prisma.user.findUnique({
        where:{
            email:data.email
        }
    });
    if(!metadata.ip||!metadata.user_agent) throw new BadRequestException("invalid request")
    if(!user||!user.hashed_password) throw new BadRequestException("invalid credentials")
    const isCorrectPassword = await verify(user.hashed_password,data.password)
    if(!isCorrectPassword)  throw new BadRequestException("invalid credentials")
    if(!user.is_email_verified) throw new BadRequestException("email not verified")
    const isMfaEnabled = user.mfa_enabled
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
    if(data.code && data.token ){
      
        const mfa_token = await prisma.verification_token.findFirst({
            where:{
                user_id:user.id,
                scope:'MFA',
                expires_at:{gte:new Date()},
                id:data.token
            }
        });
        if(!mfa_token) throw new NotFoundException("mfa token not found or expired")
        const isValid =await Verify(data.code,mfa_token.secret)
        if(!isValid){
        throw new BadRequestException("mfa token invalid or expired")
        }
        const session = await prisma.session.create({
        data:{
            user_id:user.id,
            ip:metadata.ip,
            user_agent:metadata.user_agent,
            expires_at:fifteenDaysFromNow()
        }
     });
     await cacheUser(user)
     await prisma.verification_token.delete({where:{id:mfa_token.id}})
     return {
        session,
        mfa_token:null,
        mfa_enabled:false
     }
    }
    const otp_token =await GenerateOtpSecret()
    await SendEmail({to:user.email!,html:generateOtpEmail(user.email!,otp_token.token,'Your MFA token'),title:"Multifaction Authentication"})
    const mfa_token = await prisma.verification_token.create({
        data:{
            user_id:user.id,
            ip:metadata.ip,
            user_agent:metadata.user_agent,
            secret:otp_token.secret,
            expires_at:fifteenMinsFromNow(),
            scope:'MFA'
        }
    })
    return {
        session:null,
          mfa_token:mfa_token.id,
        mfa_enabled:true
    }
}