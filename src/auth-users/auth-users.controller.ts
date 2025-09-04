import { Body, Controller, Post } from '@nestjs/common';
import { SignUpEmailDto } from './dto/sign-up/sign-up-email.dto';
import { GetUserMetaData } from 'src/decorators/get-user-metadata';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { AuthUsersService } from './auth-users.service';
import { VerifyTokenDto } from './dto/verify-token/verify-token.dto';
import { CredentialsSignInDto } from './dto/sign-in/credentials-sign-in.dto';

@Controller('api/auth')
export class AuthUsersController {
    constructor(
        private readonly AuthService:AuthUsersService
    ){}
    @Post('/sign-up/email')
    async SignUpUser(@Body() data:SignUpEmailDto,@GetUserMetaData() metadata:UserMetaData){
       return this.AuthService.SignUpWithEmail(metadata,data)
    }
    
    @Post('/verify/email')
    async VerifyUser(@Body() data:VerifyTokenDto,@GetUserMetaData() metadata:UserMetaData){
       return this.AuthService.VerifyUserEmail(metadata,data)
    }
    @Post('/sign-in/email')
    async CredentialsSigin(@Body() data:CredentialsSignInDto,@GetUserMetaData() metadata:UserMetaData){
       return this.AuthService.CredentialsUserSign(metadata,data)
    }
    
}
