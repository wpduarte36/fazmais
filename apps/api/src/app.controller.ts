import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Usado pelo healthcheck da Railway. Fora do rate limit pra não gastar a
  // cota de requisições do IP do proxy com os pings de saúde.
  @Get('health')
  @SkipThrottle()
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
