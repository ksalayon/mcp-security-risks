import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatService } from './chat.service';
import { SecurityService } from './security.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ChatService, SecurityService],
})
export class AppModule {}
