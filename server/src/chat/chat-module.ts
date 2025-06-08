// messages/messages.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schemas/room-schema';
import { ChatService } from './chat-services';
import { UsersModule } from 'src/user/users-module';
import { ChatGateway } from './chat.gateway';
import { ChatControllers } from './chat-controllers';
import { AuthModule } from 'src/auth/auth-module';
import { Chat, ChatSchema } from './schemas/chat-schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Room.name,
        schema: RoomSchema,
      },
      { name: Chat.name, schema: ChatSchema },
    ]),
    UsersModule,
    AuthModule,
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatControllers],
  exports: [ChatService], // Export ChatService to use in other modules
})
export class ChatModule {}
