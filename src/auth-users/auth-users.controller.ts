import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SignUpEmailDto } from './dto/sign-up/sign-up-email.dto';
import { GetUserMetaData } from 'src/decorators/get-user-metadata';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { AuthUsersService } from './auth-users.service';
import { VerifyTokenDto } from './dto/verify-token/verify-token.dto';
import { CredentialsSignInDto } from './dto/sign-in/credentials-sign-in.dto';
import { PublicOnlyGuard } from './guards/public-only.guard';
import { PrivateOnlyGuard } from './guards/private-only.guard';
import { JWTGuard } from './guards/jwt-auth.guard';
import { UserSessionToken } from 'src/utils/types/user-session-token';

@UseGuards(JWTGuard)
@Controller('api/auth')
export class AuthUsersController {
    constructor(
        private readonly AuthService:AuthUsersService
    ){}
    @UseGuards(PublicOnlyGuard)
    @Post('/sign-up/email')
    async SignUpUser(@Body() data:SignUpEmailDto,@GetUserMetaData() metadata:UserMetaData){
       return this.AuthService.SignUpWithEmail(metadata,data)
    }
    
    @Post('/verify/email')
    async VerifyUser(@Body() data:VerifyTokenDto,@GetUserMetaData() metadata:UserMetaData){
       return this.AuthService.VerifyUserEmail(metadata,data)
    }
   @UseGuards(PublicOnlyGuard)
    @Post('/sign-in/email')
    async CredentialsSigin(@Body() data:CredentialsSignInDto,@GetUserMetaData() metadata:UserMetaData){
       return this.AuthService.CredentialsUserSign(metadata,data)
    }
    @UseGuards(PrivateOnlyGuard)
    @Post('/enable/mfa')
    async Test(@Request() req,){
      const session:UserSessionToken = req['user']
      return this.AuthService.EnableUserMfa(session)
    }
    
}
