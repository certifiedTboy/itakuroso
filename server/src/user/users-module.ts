import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users-controllers';
import { UsersService } from './users-service';
import { MailerModule } from 'src/common/mailer/mailer.module';
import { User, UserSchema } from './schemas/user-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MailerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
