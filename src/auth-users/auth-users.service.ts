import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUser } from './services/create-user.service';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { SignUpEmailDto } from './dto/sign-up/sign-up-email.dto';
import { VerifyTokenDto } from './dto/verify-token/verify-token.dto';
import { VerifyUserEmailAndLogin } from './services/verifiy-user-email.service';
import { JwtService } from '@nestjs/jwt';
import { GetJwtPayloadFromSession } from 'src/utils/others/get-jwt-payload-from-session';
import { CredentialsSignInDto } from './dto/sign-in/credentials-sign-in.dto';
import { CrendentialsSignIn } from './services/credentials-signin.service';
import { CreateCredentialsJwtToken } from 'src/utils/others/create-jwt-token';
import { UserSessionToken } from 'src/utils/types/user-session-token';
import { EnabledMfa } from './services/enable-mfa.service';
import { DisableMfaDto } from './dto/disable-mfa/disable-mfa.token';
import { DisableMfa } from './services/disable-mfa.service';
import { ResendEmailVerificationToken } from './services/resend-verification-token.service';
import { ResendTokenDto } from './dto/verify-token/resend-token.dto';
import { EditUserBasicInfoDto } from './dto/edit-user/edit-user-basic-info.dto';
import { editUserBasicInfo } from './services/edit-user-baisc-info.service';

@Injectable()
export class AuthUsersService {
    constructor(
        private prisma:PrismaService,
        private jwtService:JwtService
        
    ){}

    async SignUpWithEmail(metadata:UserMetaData, data:SignUpEmailDto){
        if(!metadata.ip || !metadata.user_agent) 
        throw new BadRequestException("invalid request")
        return  CreateUser(this.prisma,data,metadata)
    }
    async VerifyUserEmail(metadata:UserMetaData,data:VerifyTokenDto){
        const session = await VerifyUserEmailAndLogin(this.prisma,data.userId,data.tokenId,data.code,metadata);
        const jwt_payload = await GetJwtPayloadFromSession(session)
        return CreateCredentialsJwtToken(this.jwtService,jwt_payload)
    }
    async CredentialsUserSign(metadata:UserMetaData,data:CredentialsSignInDto){
        const response = await CrendentialsSignIn(this.prisma,data,metadata);
        if(response.mfa_enabled || !response.session){
           return {
            mfa_enabled:true,
            success:true,
            mfa_token:response.mfa_token
           }
        }
        const jwt_payload =await GetJwtPayloadFromSession(response.session)
        return CreateCredentialsJwtToken(this.jwtService,jwt_payload)
    }
    async EnableUserMfa(session:UserSessionToken){
        return EnabledMfa(this.prisma,session.session_id,session.user_id)
    }
    async DisableUserMfa(session:UserSessionToken,metadata:UserMetaData,data:DisableMfaDto){
        return DisableMfa(this.prisma,session.user_id,metadata,data)
    }
    async ResendEmailVerificationMail(metadata:UserMetaData,data:ResendTokenDto){
        return ResendEmailVerificationToken(this.prisma,metadata,data.tokenId,data.userId,data.email)
    }
    async EditUserBasicInfo(usedId:string,data:EditUserBasicInfoDto){
        return editUserBasicInfo(this.prisma,usedId,data)
    }
}
