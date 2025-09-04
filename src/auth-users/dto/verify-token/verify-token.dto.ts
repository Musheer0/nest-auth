import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class VerifyTokenDto {

    @IsString()
    @MaxLength(6)
    @MinLength(6)
    code:string

    @IsString()
    @IsUUID()
    userId:string

    @IsString()
    @IsUUID()
    tokenId:string
}