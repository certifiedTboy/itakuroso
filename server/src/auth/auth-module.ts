import { Module } from '@nestjs/common';
import { AuthService } from './auth-services';
import { AuthControllers } from './auth.contollers';
import { UsersModule } from '../user/users-module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),

    // JwtModule.register({
    //   global: true,
    //   secret: 'this is my secret',
    //   signOptions: { expiresIn: '60s' },
    // }),
  ],
  providers: [AuthService],
  controllers: [AuthControllers],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
