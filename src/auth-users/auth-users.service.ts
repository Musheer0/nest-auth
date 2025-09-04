import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUser } from './services/create-user.service';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { SignUpEmailDto } from './dto/sign-up/sign-up-email.dto';
import { VerifyTokenDto } from './dto/verify-token/verify-token.dto';
import { VerifyUserEmailAndLogin } from './services/verifiy-user-email.service';

@Injectable()
export class AuthUsersService {
    constructor(
        private prisma:PrismaService
        
    ){}

    async SignUpWithEmail(metadata:UserMetaData, data:SignUpEmailDto){
        if(!metadata.ip || !metadata.user_agent) 
        throw new BadRequestException("invalid request")
        return  CreateUser(this.prisma,data,metadata)
    }
    async VerifyUserEmail(metadata:UserMetaData,data:VerifyTokenDto){
        const session = await VerifyUserEmailAndLogin(this.prisma,data.userId,data.tokenId,data.code,metadata);
        
    }
}
