import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ChatMessage, ChatRequest, ChatResponse } from './app.controller';
import { validatePrompt, sanitizeInput, SecurityFlag, createSecurityGuardMessage } from '@mcp-security-risks/shared';
import { ConfigService } from './config.service';
import { MCPServerFactory } from '@mcp-security-risks/mcp-tools';
import { generateText, experimental_createMCPClient, stepCountIs, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

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

      // Optionally execute an MCP tool call (single-shot) before LLM
      let toolResultText = '';
      if (request.toolUse && request.mcp) {
        try {
          const server = MCPServerFactory.createServer(request.mcp.type);
          const toolResp = await server.handleRequest({
            id: `${Date.now()}`,
            method: request.mcp.method,
            params: request.mcp.params || {},
            timestamp: new Date()
          });
          if (toolResp.error) {
            toolResultText = `Tool error (${request.mcp.type}.${request.mcp.method}): ${toolResp.error.message}`;
          } else {
            toolResultText = `Tool result (${request.mcp.type}.${request.mcp.method}): ${JSON.stringify(toolResp.result)}`;
          }
        } catch (e) {
          toolResultText = `Tool invocation failed: ${e instanceof Error ? e.message : 'unknown error'}`;
        }
      }

      // Generate AI response via Anthropic Messages API (prepend tool result as system context when present)
      const llmMessages = toolResultText
        ? [
            ...request.messages,
            { role: 'system', content: toolResultText, timestamp: new Date() } as ChatMessage,
          ]
        : request.messages;

      // Add security guard system message to prevent sensitive content disclosure (if enabled)
      if (request.securityGuard !== false) { // Default to true if not specified
        const securityGuardMessage = createSecurityGuardMessage(true);
        llmMessages.unshift(securityGuardMessage);
      }

      const { text } = await this.callAnthropic(
        llmMessages,
        request.model || this.configService.getAnthropicModel() || 'claude-3-5-haiku-latest',
        request.temperature || 0.7,
        request.maxTokens || 1024
      );

      const response: ChatResponse = {
        message: {
          role: 'assistant',
          content: text,
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

      // Generate AI response with raw input via Anthropic
      const { text } = await this.callAnthropic(
        rawMessages,
        request.model || this.configService.getAnthropicModel() || 'claude-3-5-haiku-latest',
        request.temperature || 0.7,
        request.maxTokens || 1024
      );

      const response: ChatResponse = {
        message: {
          role: 'assistant',
          content: text,
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

  // New method to process chat with Vercel AI SDK
  async processChatWithVercelAI(request: ChatRequest): Promise<ChatResponse> {
    const mcpClient: any = null;
    
    try {
      this.logger.log('Processing chat with Vercel AI SDK');
      
      // Check if security bypass is enabled
      const bypassSecurity = this.configService.isFeatureEnabled('bypassSecurityValidation');
      
      let securityFlags: SecurityFlag[] = [];
      
      if (bypassSecurity) {
        this.logger.warn('SECURITY BYPASS ENABLED - Raw attack behavior will be shown');
        securityFlags = [];
      } else {
        // Normal security validation
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

      // Prepare messages for Vercel AI
      const messages = request.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      // Add security guard system message to prevent sensitive content disclosure (if enabled)
      if (request.securityGuard !== false) { // Default to true if not specified
        const securityGuardMessage = createSecurityGuardMessage(true);
        messages.unshift(securityGuardMessage);
      }

      // Initialize tools object
      let tools = {};

      // Handle MCP tools if configured
      if (request.mcp) {
        try {
          // For now, use our mock MCP server factory for the existing types
          if (['filesystem', 'text-document', 'network', 'vulnerable'].includes(request.mcp!.type)) {
            const server = MCPServerFactory.createServer(request.mcp!.type);
            const availableMethods = server.getAvailableMethods();
            
            // Create tools from the server's available methods using the correct tool() format
            const serverTools: Record<string, any> = {};
            
            availableMethods.forEach(method => {
              // Define the appropriate inputSchema based on the method
              let inputSchema: any;
              
              switch (method) {
                case 'read_file':
                  inputSchema = z.object({
                    path: z.string().describe('Path to the file to read')
                  });
                  break;
                case 'write_file':
                  inputSchema = z.object({
                    path: z.string().describe('Path to the file to write'),
                    content: z.string().describe('Content to write to the file')
                  });
                  break;
                case 'delete_file':
                  inputSchema = z.object({
                    path: z.string().describe('Path to the file to delete')
                  });
                  break;
                case 'list_files':
                  inputSchema = z.object({
                    directory: z.string().describe('Directory to list files from')
                  });
                  break;
                case 'read_sensitive_file':
                  inputSchema = z.object({
                    path: z.string().describe('Path to the sensitive file to read (demonstrates vulnerability)')
                  });
                  break;
                case 'get_text':
                  inputSchema = z.object({
                    documentId: z.string().describe('ID of the document to get text from')
                  });
                  break;
                case 'set_text':
                  inputSchema = z.object({
                    documentId: z.string().describe('ID of the document to set text for'),
                    text: z.string().describe('Text to set in the document')
                  });
                  break;
                case 'search_text':
                  inputSchema = z.object({
                    documentId: z.string().describe('ID of the document to search in'),
                    query: z.string().describe('Search query')
                  });
                  break;
                case 'replace_text':
                  inputSchema = z.object({
                    documentId: z.string().describe('ID of the document to replace text in'),
                    search: z.string().describe('Text to search for'),
                    replace: z.string().describe('Text to replace with')
                  });
                  break;
                case 'http_request':
                  inputSchema = z.object({
                    url: z.string().describe('URL to make HTTP request to'),
                    options: z.object({}).optional().describe('HTTP request options')
                  });
                  break;
                case 'websocket_connect':
                  inputSchema = z.object({
                    url: z.string().describe('WebSocket URL to connect to')
                  });
                  break;
                case 'ping':
                  inputSchema = z.object({
                    clientId: z.string().optional().describe('Client ID for ping')
                  });
                  break;
                case 'get_description':
                  inputSchema = z.object({
                    userInput: z.string().describe('User input for description')
                  });
                  break;
                case 'get_poisoned_tool':
                  inputSchema = z.object({
                    userInstruction: z.string().describe('User instruction for getting poisoned tool')
                  });
                  break;
                case 'get_config':
                  inputSchema = z.object({
                    configParam: z.string().describe('Configuration parameter')
                  });
                  break;
                case 'get_metadata':
                  inputSchema = z.object({
                    metadataParam: z.string().describe('Metadata parameter')
                  });
                  break;
                default:
                  inputSchema = z.object({});
              }
              
              serverTools[`${request.mcp!.type}_${method}`] = tool({
                description: `${method} method for ${request.mcp!.type} server`,
                inputSchema,
                execute: async (params: any) => {
                  try {
                    this.logger.log(`Executing MCP tool: ${request.mcp!.type}_${method} with params: ${JSON.stringify(params)}`);
                    this.logger.log(`🔍 Debug - Params type: ${typeof params}`);
                    this.logger.log(`🔍 Debug - Params keys: ${params ? Object.keys(params) : 'undefined'}`);
                    this.logger.log(`🔍 Debug - Params path: ${params?.path || 'undefined'}`);
                    
                    const toolResp = await server.handleRequest({
                      id: `${Date.now()}`,
                      method: method,
                      params: params,
                      timestamp: new Date()
                    });
                    
                    if (toolResp.error) {
                      this.logger.error(`MCP tool error: ${toolResp.error.message}`);
                      return { error: toolResp.error.message };
                    }
                    
                    this.logger.log(`MCP tool result: ${JSON.stringify(toolResp.result)}`);
                    return toolResp.result;
                  } catch (error) {
                    this.logger.error(`MCP tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    return { error: error instanceof Error ? error.message : 'Unknown error' };
                  }
                }
              });
            });
            
            // Add the server tools to the tools object
            tools = { ...tools, ...serverTools };
            
            this.logger.log(`Created ${Object.keys(serverTools).length} tools from ${request.mcp!.type} server for AI to use`);
            this.logger.log(`🔍 Debug - Available tools:`, Object.keys(serverTools));
            this.logger.log(`🔍 Debug - Tool details:`, Object.entries(serverTools).map(([name, tool]) => ({ name, description: tool.description })));
          } else {
            // For new transport types (stdio, http, sse), we would need to implement proper MCP clients
            // For now, log that these are not yet implemented
            this.logger.warn(`MCP transport type '${request.mcp!.type}' not yet implemented, skipping MCP tools`);
          }
        } catch (error) {
          this.logger.error(`Failed to handle MCP request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Generate AI response using Vercel AI SDK with OpenAI and dynamic tool calling
      const { text, usage, toolCalls, toolResults } = await generateText({
        model: openai(request.model || 'gpt-4o'),
        messages,
        tools: Object.keys(tools).length > 0 ? tools : undefined,
        temperature: request.temperature || 0.7,
        stopWhen: stepCountIs(5), // Allow up to 5 tool calls as per documentation
      });

      // Log tool usage for debugging
      if (toolCalls && toolCalls.length > 0) {
        this.logger.log(`AI made ${toolCalls.length} tool calls:`, toolCalls.map(tc => tc.toolName));
        this.logger.log(`🔍 Debug - Tool call details:`, toolCalls.map(tc => ({
          toolName: tc.toolName,
          args: (tc as any).args,
          argsString: (tc as any).argsString
        })));
      }
      
      if (toolResults && toolResults.length > 0) {
        this.logger.log(`Tool results received:`, toolResults.length);
        this.logger.log(`🔍 Debug - Tool result details:`, toolResults.map(tr => ({
          toolName: tr.toolName,
          result: (tr as any).result
        })));
      }

      const response: ChatResponse = {
        message: {
          role: 'assistant',
          content: text,
          timestamp: new Date()
        },
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        securityFlags: securityFlags.length > 0 ? securityFlags : undefined
      };

      this.logger.log(`Vercel AI chat processed successfully. Tokens used: ${response.usage?.totalTokens}`);
      return response;

    } catch (error) {
      this.logger.error(`Error processing Vercel AI chat: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : '');
      throw new Error(`Failed to process Vercel AI chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Always close the MCP client to release resources
      if (mcpClient) {
        try {
          await mcpClient.close();
        } catch (error) {
          this.logger.error(`Error closing MCP client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
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

  private async callAnthropic(
    messages: ChatMessage[],
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<{ text: string }>{
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    // Extract optional system prompt and map messages
    const systemParts = messages.filter(m => m.role === 'system').map(m => m.content);
    const system = systemParts.length ? systemParts.join('\n\n') : undefined;
    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: [{ type: 'text', text: m.content }]
      }));

    const resp = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        max_tokens: maxTokens,
        temperature,
        messages: chatMessages,
        ...(system ? { system } : {})
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = resp.data?.content;
    const text = Array.isArray(content) && content[0]?.type === 'text' ? content[0].text : '';
    return { text };
  }
}

