import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUser } from './services/create-user.service';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { SignUpEmailDto } from './dto/sign-up/sign-up-email.dto';

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
}
