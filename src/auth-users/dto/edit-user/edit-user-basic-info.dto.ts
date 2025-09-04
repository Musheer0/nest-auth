import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class EditUserBasicInfoDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  image_url?: string;
}
