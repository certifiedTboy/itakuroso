import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const configService: ConfigService = app.get(ConfigService);

  /**
   * @method app.useGlobalFilters
   * @description This method is used to set up global exception filters.
   * It allows you to handle exceptions in a centralized manner,
   */
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = configService.get<string>('PORT');

  await app.listen(port ?? 3000);
}
bootstrap();
