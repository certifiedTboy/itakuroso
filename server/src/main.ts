import { NestFactory } from '@nestjs/core';
import { BadRequestException, VersioningType } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
// import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/exceptions/http-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   *
   * @description This method is used to enable versioning for the API.
   * It allows you to manage different versions of your API endpoints.
   * The versioning type is set to URI, meaning the version will be included in the URL.
   * For example, a request to /api/v1/users will be routed to the v1 version of the users controller.
   * This is useful for maintaining backward compatibility when making changes to the API.
   * The global prefix 'api' is set, so all routes will be prefixed with /api.
   */
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Enable CORS for React Native app
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get<string>('PORT');

  /**
   * @method app.useGlobalFilters
   * @description This method is used to set up global exception filters.
   * It allows you to handle exceptions in a centralized manner,
   */
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws error for extra fields
      transform: true, // transforms payloads to DTO instances
      stopAtFirstError: true, // stops at the first validation error

      exceptionFactory: (errors) => {
        const errorMessage = errors[0].constraints
          ? Object.values(errors[0].constraints).join(', ')
          : '';
        throw new BadRequestException('', {
          cause: errorMessage,
          description: errorMessage,
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('itakuroso API')
    .setDescription('The itakuroso API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port ?? 9000);
}
bootstrap();
