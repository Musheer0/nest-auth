import { IsEmail, IsOptional, IsString } from "class-validator"

export class CredentialsSignInDto {
       @IsEmail()
        @IsString()
        email:string
    
        @IsString()
        password:string

        //mfa enabled sign-in
        @IsString()
        @IsOptional()
        code:string
        
        //mfa enabled sign-in
        @IsString()
        @IsOptional()
        token:string
}