import { Injectable, Logger } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { ChatMessage, ChatRequest, ChatResponse } from './app.controller';
import { validatePrompt, sanitizeInput, SecurityFlag } from '@mcp-security-risks/shared';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  async processChat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Validate and sanitize input
      const securityFlags: SecurityFlag[] = [];
      
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
        maxTokens: request.maxTokens || 1000,
      });

      const response: ChatResponse = {
        message: {
          role: 'assistant',
          content: result.text,
          timestamp: new Date()
        },
        usage: {
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
          totalTokens: result.usage?.totalTokens || 0
        },
        securityFlags: securityFlags.length > 0 ? securityFlags : undefined
      };

      this.logger.log(`Chat processed successfully. Tokens used: ${response.usage?.totalTokens}`);
      return response;

    } catch (error) {
      this.logger.error(`Error processing chat: ${error.message}`, error.stack);
      throw new Error(`Failed to process chat: ${error.message}`);
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

