import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../user/schemas/user-schema';
import * as mongoose from 'mongoose';

export type ChatDocument = mongoose.HydratedDocument<Chat>;

@Schema()
export class Chat {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  senderId: User;

  @Prop({ required: true, unique: true })
  message: string;

  @Prop()
  file: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
