import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateNewTokenDto {
  @IsString()
  @IsNotEmpty()
  readonly email: string;
}
