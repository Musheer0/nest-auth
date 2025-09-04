import { IsString, IsUUID, Length, MaxLength, MinLength } from "class-validator";

export class VerifyTokenDto {

    @IsString()
    @Length(6, 6, { message: 'Code must be exactly 6 characters long' })
    code:string

    @IsString()
    @IsUUID()
    userId:string

    @IsString()
    @IsUUID()
    tokenId:string
}