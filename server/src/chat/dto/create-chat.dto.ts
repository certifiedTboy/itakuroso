import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  readonly roomId: string;

  @IsString()
  @IsNotEmpty()
  readonly chatRoomId: string;

  @IsString()
  @IsOptional()
  readonly file?: string;

  @IsString()
  @IsOptional()
  readonly message: string;

  @IsString()
  @IsNotEmpty()
  readonly senderId: string;
}
