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
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './queue/queue-module';
// import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat-module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),

      inject: [ConfigService],
    }),
    // BullModule.forRoot({
    //   connection: {
    //     host: 'localhost',
    //     port: 6379,
    //   },
    //   defaultJobOptions: {
    //     removeOnComplete: true,
    //     removeOnFail: true,
    //   },
    // }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
        },
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true, // makes the config accessible globally
      cache: true, // caches the config for performance
    }),

    /**
     * global configuration for rate limiting on all endpoints
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
    QueueModule,
    AuthModule,
    UsersModule,
    ChatModule,
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
  ],
})
export class AppModule {}
