import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class DisableMfaDto {
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'Code must be exactly 6 characters long' })
  code?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  token: string;
}
