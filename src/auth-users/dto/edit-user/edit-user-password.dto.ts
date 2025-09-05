import { IsEmail, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class EditUserPasswordDto {
  @IsOptional()
  @IsString()
  email:string
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @IsUUID("4", { message: "Token must be a valid UUID" })
  tokenId?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6, { message: "Code must be  6 characters" })
  code?: string;
}
