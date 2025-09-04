import { PrismaClient } from "@prisma/client";
import { SignUpEmailDto } from "../dto/sign-up/sign-up-email.dto";
import { GetUserByEmail } from "./get-user-by-email.service";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { UserMetaData } from "src/utils/types/user-metadata";
import { hash } from "argon2";
import { GenerateOtpSecret } from "src/utils/others/encrypt-secret";
import { fifteenMinsFromNow } from "src/utils/others/date-utils";
import { SendEmail } from "src/utils/emails/send-email";
import { generateOtpEmail } from "src/utils/emails/templates/otp-template";

export const  CreateUser = async(prisma:PrismaClient, data:SignUpEmailDto, metadata:UserMetaData)=>{
    const existing_user = await  GetUserByEmail(prisma,data.email)
    if(existing_user)
    throw new ConflictException("email already in-use")
    const hashed_password = await hash(data.password)
    if(!metadata.ip ||!metadata.user_agent) throw new BadRequestException("invalid request")
    const new_user = await prisma.user.create({
        data:{
            name:data.name||data.email.split('@')[0],
            email:data.email,
            hashed_password,
            initial_ip:metadata.ip!
        },
        select:{
            id:true
        }
    });
    const secret =await GenerateOtpSecret()
    await SendEmail({to:data.email,html:generateOtpEmail(data.email,secret.token,'Verify your account'),title:'Verify your account'})
    const verification_token = await prisma.verification_token.create({
        data:{
            user_id:new_user.id,
            ip:metadata.ip,
            user_agent:metadata.user_agent,
            secret:secret.secret,
            expires_at:fifteenMinsFromNow()
        },
        select:{
            id:true
        }
    })
    return {
        success:true,
        data: {
            user_id: new_user.id,
            token :verification_token.id,
            email_verified:false
        }
    }
}