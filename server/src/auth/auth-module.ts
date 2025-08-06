import { Module } from '@nestjs/common';
import { AuthService } from './auth-services';
import { AuthControllers } from './auth.contollers';
import { UsersModule } from '../user/users-module';
import { AccessJWTModule } from '../common/jwt/access-jwt.module';
import { RefreshJWTModule } from 'src/common/jwt/refresh-jwt.module';

@Module({
  imports: [UsersModule, AccessJWTModule, RefreshJWTModule],
  providers: [AuthService],
  controllers: [AuthControllers],
  exports: [AuthService],
})
export class AuthModule {}
