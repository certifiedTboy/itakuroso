import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = mongoose.HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop()
  country: string;

  @Prop({ default: null })
  verificationCode: string;

  @Prop()
  verificationCodeExpiresIn: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  passcode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
