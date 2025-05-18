import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { AppModule } from './../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';

let app: INestApplication;
let connection: Connection;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  // Get database connection
  connection = moduleFixture.get<Connection>(getConnectionToken());
});

afterAll(async () => {
  // Clean up all data
  if (connection.db) {
    await connection.db.dropDatabase();
  }
  await app.close();
});

describe('Auth /api/v1/auth/login (POST)', () => {
  it('it should return jwt authentication token', async () => {
    const userData = {
      email: 'etosin70@yopmail.com',
      phoneNumber: '08135359082',
    };

    const response = await request(app.getHttpServer())
      .post('/users/create')
      .send(userData);

    // console.log(response.body.data.verificationCode);

    const body = response.body as {
      statusCode: number;
      message: string;
      data: {
        email: string;
        phoneNumber: string;
        verificationCode: string;
      };
    };

    await request(app.getHttpServer())
      .patch('/users/verify')
      .send({ verificationCode: body.data.verificationCode });

    const loginData = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ passCode: '123456', email: body.data.email });

    const loginBody = loginData.body as {
      statusCode: number;
      message: string;
      data: {
        authToken: string;
      };
    };

    expect(loginBody.statusCode).toBe(200);
    expect(loginBody.data.authToken).toBeDefined();
  });
});
