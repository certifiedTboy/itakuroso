import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../user/schemas/user-schema';

export type RoomDocument = mongoose.HydratedDocument<Room>;

@Schema()
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
}

export const RoomSchema = SchemaFactory.createForClass(Room);
