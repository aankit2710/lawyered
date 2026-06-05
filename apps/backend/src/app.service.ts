import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string } {
    return {
      message: 'Welcome to Lawyered Will Maker API v0.1.0',
    };
  }
}
