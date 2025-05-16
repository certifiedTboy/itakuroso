import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1 (GET)', async () => {
    const response: request.Response = await request(app.getHttpServer()).get(
      '/',
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data', { result: 'Server is live!' });
  });
});
