import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
// import { App } from 'supertest/types';
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

let verificationCode: string;

describe('/api/v1/users (POST)', () => {
  it('should return 400 if correct user data is not provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/create')
      .send({});

    expect(response.status).toBe(400);
    expect(response.badRequest).toBeTruthy();
  });

  it('should create a user', async () => {
    const userData = {
      email: 'etosin70@yopmail.com',
      phoneNumber: '08135359082',
    };

    const response = await request(app.getHttpServer())
      .post('/users/create')
      .send(userData);

    const body = response.body as {
      statusCode: number;
      message: string;
      data: {
        email: string;
        phoneNumber: string;
        verificationCode: string;
      };
    };

    verificationCode = body.data.verificationCode;

    expect(body.statusCode).toBe(201);
    expect(body.data.email).toBe(userData.email);
    expect(body.data.phoneNumber).toBe(userData.phoneNumber);
    expect(body.data.verificationCode).toBeDefined();
    expect(body.data.verificationCode).toHaveLength(6);
    expect(body.data.verificationCode).toMatch(/^\d{6}$/);
  });
});

describe('/api/v1/users/verify (PATCH', () => {
  it('should return 400 if verification code is not provided', async () => {
    await request(app.getHttpServer())
      .patch('/users/verify')
      .send({ verificationCode: '' })
      .expect(500);
  });

  it('should return 200 if verification code is valid', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/verify')
      .send({ verificationCode });

    const body = response.body as {
      statusCode: number;
      message: string;
      data: {
        verificationCode: string;
        isVerified: boolean;
      };
    };

    expect(body).toHaveProperty('statusCode', 200);
    expect(body).toHaveProperty('message', 'User verified successfully');

    expect(body.data.isVerified).toBe(true);
    expect(body.data.verificationCode).toBe(null);
  });
});
