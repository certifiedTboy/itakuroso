import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return object response of statusCode, message and data', () => {
      const result = appController.getHello();
      const data = Object.values(result);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('data');
      expect(data[0]).toEqual(200);
    });
  });
});
