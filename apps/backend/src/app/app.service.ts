import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'MCP Security Risks Backend is running!';
  }

  getData(): { message: string } {
    return { message: 'Welcome to MCP Security Risks API' };
  }
}
