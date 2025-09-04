import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUser } from './services/create-user.service';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { SignUpEmailDto } from './dto/sign-up/sign-up-email.dto';
import { VerifyTokenDto } from './dto/verify-token/verify-token.dto';
import { VerifyUserEmailAndLogin } from './services/verifiy-user-email.service';
import { JwtService } from '@nestjs/jwt';

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
        const jwt_payload = {
            session_id:session.id,
            used_id:session.user_id,
            expires_at:session.expires_at
        };
        const jwtToken = this.jwtService.sign(jwt_payload)
        return {
            success:true,
            token:jwtToken
        }
    }
}
