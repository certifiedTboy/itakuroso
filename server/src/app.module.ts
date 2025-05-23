import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HttpExceptionFilter } from './common/exceptions/http-exceptions.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/users-module';
import { AuthModule } from './auth/auth-module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),

      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true, // makes the config accessible globally
      cache: true, // caches the config for performance
    }),

    /**
     * global configuration for rating limiting on all endpoints
     * @params {string} ttl: time to live in seconds
     * @params {} limit: number of requests allowed in the ttl period
     */
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),

    /**
     * global configuration of other modules
     */
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],

  /**
   * global providers
   * @params {APP_FILTER} - global exception filter. handles all exceptions
   * @params {APP_GUARD} - global guard
   * @params {APP_INTERCEPTOR} - global interceptor
   * @params {APP_PIPE} - global pipe
   */
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ChatGateway,
  ],
})
export class AppModule {}
