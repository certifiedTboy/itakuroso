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

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetTokenExpiresIn: Date;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ default: Date.now() })
  lastSeen: Date;

  @Prop({ default: null })
  profilePicture: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  passcode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
