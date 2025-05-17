import { IsString, IsEmail, IsNotEmpty, IsMobilePhone } from 'class-validator';

export class CreateUserDto {
  @IsMobilePhone('en-NG', { strictMode: false })
  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
