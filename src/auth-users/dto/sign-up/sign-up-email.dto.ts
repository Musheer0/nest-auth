import {IntersectionType} from '@nestjs/mapped-types'
import { SignUpDto } from './sign-up.dto';
import { IsEmail, IsString } from 'class-validator';
export class SignUpEmailDto extends IntersectionType(SignUpDto){
    @IsEmail()
    @IsString()
    email:string

    @IsString()
    password:string
}