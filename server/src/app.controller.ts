import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseHandler } from './common/response-handler/response-handler';

@Controller({
  path: '',
  version: '1',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): object {
    const result = this.appService.getHello();

    return ResponseHandler.ok(200, 'success', { result });
  }
}
