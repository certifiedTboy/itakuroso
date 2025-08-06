import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshJwtService } from './refresh-jwt-service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        signOptions: {
          expiresIn:
            configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d',
        },
      }),

      inject: [ConfigService],
    }),
  ],
  providers: [RefreshJwtService],
  exports: [RefreshJwtService],
})
export class RefreshJWTModule {}
