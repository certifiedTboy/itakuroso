import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users-controllers';
import { UsersService } from './users-service';
import { User, UserSchema } from './schemas/user-schema';
import { QueueModule } from '../queue/queue-module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    QueueModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService to use in other modules
})
export class UsersModule {}
