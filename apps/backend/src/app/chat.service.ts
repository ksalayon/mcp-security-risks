import { Injectable, Logger } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { ChatMessage, ChatRequest, ChatResponse } from './app.controller';
import { validatePrompt, sanitizeInput, SecurityFlag } from '@mcp-security-risks/shared';
import { ConfigService } from './config.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly configService: ConfigService) {}

  async processChat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Check if security bypass is enabled
      const bypassSecurity = this.configService.isFeatureEnabled('bypassSecurityValidation');
      
      let securityFlags: SecurityFlag[] = [];
      
      if (bypassSecurity) {
        this.logger.warn('SECURITY BYPASS ENABLED - Raw attack behavior will be shown');
        // Skip all security validation when bypass is enabled
        securityFlags = [];
      } else {
        // Normal security validation
        // Check each message for security issues
        for (const message of request.messages) {
          const sanitizedContent = sanitizeInput(message.content);
          const validation = validatePrompt(sanitizedContent);
          
          if (!validation.isValid) {
            securityFlags.push(...validation.flags);
          }
          
          // Update message with sanitized content
          message.content = sanitizedContent;
        }
      }

      // If security flags are detected, log them
      if (securityFlags.length > 0) {
        this.logger.warn(`Security flags detected: ${JSON.stringify(securityFlags)}`);
      }

      // Generate AI response
      const result = await generateText({
        model: openai(request.model || 'gpt-4o-mini'),
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: request.temperature || 0.7,
      });

      const response: ChatResponse = {
        message: {
          role: 'assistant',
          content: result.text,
          timestamp: new Date()
        },
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        securityFlags: securityFlags.length > 0 ? securityFlags : undefined
      };

      this.logger.log(`Chat processed successfully. Tokens used: ${response.usage?.totalTokens}`);
      return response;

    } catch (error) {
      this.logger.error(`Error processing chat: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
      throw new Error(`Failed to process chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // New method to process chat with raw attack behavior
  async processChatWithRawAttacks(request: ChatRequest): Promise<ChatResponse> {
    try {
      this.logger.warn('PROCESSING CHAT WITH RAW ATTACK BEHAVIOR - Security validation disabled');
      
      // Skip all security validation and sanitization
      const rawMessages = request.messages.map(msg => ({
        role: msg.role,
        content: msg.content // Use raw, unsanitized content
      }));

      // Generate AI response with raw input
      const result = await generateText({
        model: openai(request.model || 'gpt-4o-mini'),
        messages: rawMessages,
        temperature: request.temperature || 0.7,
      });

      const response: ChatResponse = {
        message: {
          role: 'assistant',
          content: result.text,
          timestamp: new Date()
        },
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        securityFlags: [] // No security flags when bypassing
      };

      this.logger.log(`Raw attack chat processed. Tokens used: ${response.usage?.totalTokens}`);
      return response;

    } catch (error) {
      this.logger.error(`Error processing raw attack chat: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
      throw new Error(`Failed to process raw attack chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateMessage(message: ChatMessage): Promise<{ isValid: boolean; flags: SecurityFlag[] }> {
    const sanitizedContent = sanitizeInput(message.content);
    const validation = validatePrompt(sanitizedContent);
    
    return {
      isValid: validation.isValid,
      flags: validation.flags
    };
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    // In a real application, this would fetch from a database
    return [];
  }

  async clearChatHistory(): Promise<void> {
    // In a real application, this would clear from a database
    this.logger.log('Chat history cleared');
  }
}

