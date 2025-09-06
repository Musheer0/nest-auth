import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResendTokenDto {
  @IsString()
  @IsUUID()
  @IsOptional()
  userId: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  tokenId: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;
}
