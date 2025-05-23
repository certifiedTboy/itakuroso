import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  _id?: string;

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
