import { IsEmail, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class EditUserEmailDto {
  @IsEmail({}, { message: "Email must be valid" })
  email: string;

  @IsOptional()
  @IsString()
  @IsUUID("4", { message: "Token must be a valid UUID" })
  tokenId?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6, { message: "Code must be  6 characters" })
  code?: string;
}
