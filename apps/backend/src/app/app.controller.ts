import { Controller, Post, Get, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatService } from './chat.service';
import { SecurityService } from './security.service';
import { MCPServerFactory } from '@mcp-security-risks/mcp-tools';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  toolUse?: boolean;
  mcp?: {
    type: 'filesystem' | 'text-document' | 'network' | 'vulnerable';
    method: string;
    params?: Record<string, any>;
  };
}

export interface ChatResponse {
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  securityFlags?: any[];
}

export interface SecurityTestRequest {
  riskCategory?: string;
  runAll?: boolean;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatService: ChatService,
    private readonly securityService: SecurityService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('chat')
  async chat(@Body() request: ChatRequest): Promise<ChatResponse> {
    return await this.chatService.processChat(request);
  }

  @Post('chat/raw-attack')
  async chatRawAttack(@Body() request: ChatRequest): Promise<ChatResponse> {
    return await this.chatService.processChatWithRawAttacks(request);
  }

  @Get('security/risks')
  async getSecurityRisks() {
    return await this.securityService.getSecurityRisks();
  }

  @Post('security/test')
  async runSecurityTest(@Body() request: SecurityTestRequest) {
    if (request.runAll) {
      return await this.securityService.runAllTests();
    } else if (request.riskCategory) {
      return await this.securityService.runRiskTests(request.riskCategory);
    } else {
      throw new Error('Either runAll or riskCategory must be specified');
    }
  }

  @Get('security/status')
  async getSecurityStatus() {
    return await this.securityService.getSecurityStatus();
  }

  @Get('health')
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        chat: 'operational',
        security: 'operational',
        mcp: 'operational'
      }
    };
  }

  @Get('config/feature-flags')
  async getFeatureFlags() {
    return this.securityService.getFeatureFlags();
  }

  @Get('mcp/methods')
  async getMcpMethods() {
    return MCPServerFactory.listAllMethods();
  }
}
