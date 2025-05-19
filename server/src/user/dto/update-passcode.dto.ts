import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class UpdatePasscodeDto {
  @IsString()
  @IsNotEmpty()
  readonly passcode: string;

  @IsString()
  @IsEmail()
  readonly email: string;
}
