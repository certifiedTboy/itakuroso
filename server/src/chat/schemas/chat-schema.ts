import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Room } from './room-schema';
import * as mongoose from 'mongoose';

export type ChatDocument = mongoose.HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
  @Prop()
  senderId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true })
  roomId: Room;

  @Prop({ required: true })
  chatRoomId: string;

  @Prop()
  message: string;

  @Prop()
  file: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' })
  replyTo?: ChatDocument;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
