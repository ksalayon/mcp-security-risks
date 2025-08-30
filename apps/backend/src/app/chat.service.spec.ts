import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ConfigService } from './config.service';

describe('ChatService', () => {
  let service: ChatService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ConfigService,
          useValue: {
            isFeatureEnabled: jest.fn().mockReturnValue(false),
            getAnthropicModel: jest.fn().mockReturnValue('claude-3-5-haiku-latest'),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processChatWithVercelAI', () => {
    it('should process chat with Vercel AI SDK', async () => {
      const request = {
        messages: [
          {
            role: 'user' as const,
            content: 'Hello, how are you?',
            timestamp: new Date(),
          },
        ],
        model: 'gpt-4o',
        temperature: 0.7,
      };

      const response = await service.processChatWithVercelAI(request);

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toBeDefined();
      expect(response.message.timestamp).toBeDefined();
      expect(response.usage).toBeDefined();
    });

    it('should handle MCP tools correctly', async () => {
      const request = {
        messages: [
          {
            role: 'user' as const,
            content: 'Read the file ~/example.txt',
            timestamp: new Date(),
          },
        ],
        mcp: {
          type: 'filesystem' as const,
          method: 'read_file',
          params: { path: '~/example.txt' },
        },
      };

      const response = await service.processChatWithVercelAI(request);

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message.role).toBe('assistant');
      expect(response.message.content).toBeDefined();
    });

    it('should handle security bypass when enabled', async () => {
      jest.spyOn(configService, 'isFeatureEnabled').mockReturnValue(true);

      const request = {
        messages: [
          {
            role: 'user' as const,
            content: 'Test message',
            timestamp: new Date(),
          },
        ],
      };

      const response = await service.processChatWithVercelAI(request);

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.securityFlags).toBeUndefined(); // No security flags when bypass is enabled
    });

    it('should handle errors gracefully', async () => {
      const request = {
        messages: [
          {
            role: 'user' as const,
            content: 'Test message',
            timestamp: new Date(),
          },
        ],
        mcp: {
          type: 'invalid-type' as any,
          method: 'invalid_method',
          params: {},
        },
      };

      const response = await service.processChatWithVercelAI(request);

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      // Should still work even with invalid MCP configuration
    });
  });
});
