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
import { DisableMfaDto } from './dto/disable-mfa/disable-mfa.token';
import { ResendTokenDto } from './dto/verify-token/resend-token.dto';

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
    @UseGuards(PublicOnlyGuard)
    @Post('/verify/email')
    async VerifyUser(@Body() data:VerifyTokenDto,@GetUserMetaData() metadata:UserMetaData){
       return this.AuthService.VerifyUserEmail(metadata,data)
    }
    @UseGuards(PublicOnlyGuard)
    @Post('/resend/verify/email')
    async ResendVerifyEmail(@Body() data:ResendTokenDto,@GetUserMetaData() metadata:UserMetaData){
       return this.AuthService.ResendEmailVerificationMail(metadata,data)
    }

   @UseGuards(PublicOnlyGuard)
    @Post('/sign-in/email')
    async CredentialsSigin(@Body() data:CredentialsSignInDto,@GetUserMetaData() metadata:UserMetaData){
       return this.AuthService.CredentialsUserSign(metadata,data)
    }
    @UseGuards(JWTGuard)
    @Post('/enable/mfa')
    async EnableMfa(@Request() req,){
      const session:UserSessionToken = req['user']
      return this.AuthService.EnableUserMfa(session)
    }
    @UseGuards(JWTGuard)
    @Post('/disable/mfa')
    async DisableMfa(@Request() req,@GetUserMetaData() metadata:UserMetaData,@Body() data:DisableMfaDto,){
      const session:UserSessionToken = req['user']
      return this.AuthService.DisableUserMfa(session,metadata,data)
    }
    
}
