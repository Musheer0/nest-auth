import { IsEmail, IsOptional, IsString } from "class-validator";

export class SignUpDto {
    @IsString()
    @IsOptional()
    name:string
}