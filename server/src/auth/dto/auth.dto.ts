import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  readonly passCode: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
