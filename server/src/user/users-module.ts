import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users-controllers';
import { UsersService } from './users-service';
import { User, UserSchema } from './schemas/user-schema';
import { QueueModule } from '../queue/queue-module';
import { AccessJWTModule } from '../common/jwt/access-jwt.module';
import { FileUploadModule } from '../common/file-upload/file-upload-module';
import { AuthGuard } from '../guard/auth-guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    QueueModule,
    AccessJWTModule,
    FileUploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthGuard],
  exports: [UsersService], // Export UsersService to use in other modules
})
export class UsersModule {}
