import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CredentialsSignInDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  password: string;

  //mfa enabled sign-in
  @IsString()
  @IsOptional()
  @Length(6, 6, { message: 'Code must be exactly 6 characters long' })
  code: string;

  //mfa enabled sign-in
  @IsString()
  @IsOptional()
  token: string;
}
