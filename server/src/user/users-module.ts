import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users-controllers';
import { UsersService } from './users-service';
import { MailerModule } from '../common/mailer/mailer.module';
import { User, UserSchema } from './schemas/user-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MailerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService to use in other modules
})
export class UsersModule {}
