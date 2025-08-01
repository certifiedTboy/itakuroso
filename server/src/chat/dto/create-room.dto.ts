import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  readonly roomId: string;

  @IsString()
  @IsOptional()
  readonly roomName?: string;

  @IsString()
  @IsOptional()
  readonly roomLink?: string;

  @IsString()
  @IsOptional()
  readonly roomImage?: string;

  @IsString()
  @IsOptional()
  readonly currentUserId: string;

  @IsString()
  @IsOptional()
  readonly otherUserId: string;

  @IsObject()
  @IsOptional()
  readonly lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
    isRead: boolean;
  };
}
