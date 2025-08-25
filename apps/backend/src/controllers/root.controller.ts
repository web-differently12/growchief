import { Controller, Get, HttpCode, Post } from '@nestjs/common';
@Controller('/')
export class RootController {
  @Get('/')
  @Post('/')
  @HttpCode(200)
  getRoot(): string {
    return 'App is running!';
  }
}
