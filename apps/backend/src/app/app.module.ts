import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatService } from './chat.service';
import { SecurityService } from './security.service';
import { ConfigService } from './config.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ChatService, SecurityService, ConfigService],
})
export class AppModule {}
