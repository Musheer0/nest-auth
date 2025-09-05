import { Body, Controller, Delete, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { SignUpEmailDto } from './dto/sign-up/sign-up-email.dto';
import { GetUserMetaData } from 'src/decorators/get-user-metadata';
import { UserMetaData } from 'src/utils/types/user-metadata';
import { AuthUsersService } from './auth-users.service';
import { VerifyTokenDto } from './dto/verify-token/verify-token.dto';
import { CredentialsSignInDto } from './dto/sign-in/credentials-sign-in.dto';
import { PublicOnlyGuard } from './guards/public-only.guard';
import { JWTGuard } from './guards/jwt-auth.guard';
import { UserSessionToken } from 'src/utils/types/user-session-token';
import { DisableMfaDto } from './dto/disable-mfa/disable-mfa.token';
import { ResendTokenDto } from './dto/verify-token/resend-token.dto';
import { EditUserBasicInfoDto } from './dto/edit-user/edit-user-basic-info.dto';
import { EditUserEmailDto } from './dto/edit-user/edit-email.dto';
import { Throttle } from '@nestjs/throttler';
import { EditUserPasswordDto } from './dto/edit-user/edit-user-password.dto';

@Controller('api/auth')
export class AuthUsersController {
    constructor(
        private readonly AuthService:AuthUsersService
    ){}
    
    @Throttle({default:{ttl:60000,limit:4}})
    @UseGuards(PublicOnlyGuard)
    @Post('/sign-up/email')
    async SignUpUser(@Body() data:SignUpEmailDto,@GetUserMetaData() metadata:UserMetaData){
        try {
            return this.AuthService.SignUpWithEmail(metadata,data)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000,limit:10}})
    @UseGuards(PublicOnlyGuard)
    @Post('/verify/email')
    async VerifyUser(@Body() data:VerifyTokenDto,@GetUserMetaData() metadata:UserMetaData){
        try {
            return this.AuthService.VerifyUserEmail(metadata,data)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000,limit:1}})
    @UseGuards(PublicOnlyGuard)
    @Post('/resend/verify/email')
    async ResendVerifyEmail(@Body() data:ResendTokenDto,@GetUserMetaData() metadata:UserMetaData){
        try {
            return this.AuthService.ResendEmailVerificationMail(metadata,data)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000,limit:4}})
    @UseGuards(PublicOnlyGuard)
    @Post('/sign-in/email')
    async CredentialsSigin(@Body() data:CredentialsSignInDto,@GetUserMetaData() metadata:UserMetaData){
        try {
            return this.AuthService.CredentialsUserSign(metadata,data)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }   

    @Throttle({default:{ttl:60000*30,limit:4}})
    @UseGuards(JWTGuard)
    @Post('/enable/mfa') 
    async EnableMfa(@Request() req){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.EnableUserMfa(session)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000*60,limit:5}})
    @UseGuards(JWTGuard)
    @Post('/disable/mfa')
    async DisableMfa(@Request() req,@GetUserMetaData() metadata:UserMetaData,@Body() data:DisableMfaDto){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.DisableUserMfa(session,metadata,data)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000*5,limit:2}})
    @UseGuards(JWTGuard)
    @Patch('/edit/basic')
    async BasicEdit(@Request() req,@GetUserMetaData() metadata:UserMetaData,@Body() data:EditUserBasicInfoDto){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.EditUserBasicInfo(session.user_id,data,session)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000*60*7,limit:5}})
    @UseGuards(JWTGuard)
    @Patch('/edit/email')
    async EmailEdit(@Request() req,@GetUserMetaData() metadata:UserMetaData,@Body() data:EditUserEmailDto){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.EditUserEmailInfo(metadata,data,session)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:1500,limit:1}})
    @UseGuards(JWTGuard)
    @Post('/user/me')
    async GetSessionInfo(@Request() req){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.GetSessionInfo(session)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:30000,limit:1}})
    @UseGuards(JWTGuard)
    @Delete('/user/logout')
    async Logout(@Request() req){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.LogoutUser(session)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000,limit:1}})
    @UseGuards(JWTGuard)
    @Delete('/user/logout-all')
    async LogoutAll(@Request() req){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.LogoutAll(session)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000*60*24,limit:1}})
    @UseGuards(JWTGuard)
    @Patch('/user/refresh')
    async RefreshToken(@Request() req){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.RefreshToken(session)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000*60*7,limit:5}})
    @UseGuards(JWTGuard)
    @Patch('/edit/password')
    async ResetPasswordAutorized(@Request() req,@GetUserMetaData() metadata:UserMetaData,@Body() data:EditUserPasswordDto){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.ResetPassword(session,metadata,data)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    @Throttle({default:{ttl:60000*60*3,limit:4}})
    @UseGuards(JWTGuard)
    @Patch('/forgot/password')
    async ResetUnAuthorizedPasswordAutorized(@Request() req,@GetUserMetaData() metadata:UserMetaData,@Body() data:EditUserPasswordDto){
        try {
            const session:UserSessionToken = req['user']
            return this.AuthService.ResetPasswordUnauth(metadata,data)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
