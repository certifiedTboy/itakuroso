import { IsString, IsNotEmpty } from 'class-validator';

export class PasscodeResetDto {
  @IsString()
  @IsNotEmpty()
  readonly resetToken: string;
}
