import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  readonly passcode: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
