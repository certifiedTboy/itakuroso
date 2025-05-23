// messages/messages.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schemas/room-schema';
import { ChatService } from './chat-services';
import { UsersModule } from 'src/user/users-module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    UsersModule,
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService], // Export ChatService to use in other modules
})
export class ChatModule {}
