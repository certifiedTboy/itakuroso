import { Module } from '@nestjs/common';
import { AuthService } from './auth-services';
import { AuthControllers } from './auth.contollers';
import { UsersModule } from '../user/users-module';
import { CustomJWTModule } from '../common/jwt/custom-jwt.module';

@Module({
  imports: [UsersModule, CustomJWTModule],
  providers: [AuthService],
  controllers: [AuthControllers],
  exports: [AuthService],
})
export class AuthModule {}
