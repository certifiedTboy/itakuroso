import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../user/schemas/user-schema';

export type RoomDocument = mongoose.HydratedDocument<Room>;

@Schema({ timestamps: true })
export class Room {
  @Prop()
  roomName: string;

  @Prop({ unique: true })
  roomId: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  members: User[];

  @Prop()
  roomLinik: string;

  @Prop()
  roomImage: string;

  @Prop({ type: Object })
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: Date;
    isRead: boolean;
    containsFile?: boolean;
  };
}

export const RoomSchema = SchemaFactory.createForClass(Room);
