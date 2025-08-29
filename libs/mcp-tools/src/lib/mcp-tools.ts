import { 
  SecurityRiskCategory, 
  SecurityRiskSeverity, 
  MCPTool, 
  SecurityLevel, 
  ValidationRule,
  SecurityFlag,
  TestScenario,
  createTestScenario
} from '@mcp-security-risks/shared';

// Mock MCP Server implementations for testing security risks

export interface MCPServerConfig {
  name: string;
  version: string;
  description: string;
  securityLevel: SecurityLevel;
  enabled: boolean;
  port?: number;
}

export interface MCPRequest {
  id: string;
  method: string;
  params: Record<string, any>;
  timestamp: Date;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  timestamp: Date;
}

// Base MCP Server class with security features
export abstract class BaseMCPServer {
  protected config: MCPServerConfig;
  protected securityFlags: SecurityFlag[] = [];
  protected requestLog: MCPRequest[] = [];
  protected responseLog: MCPResponse[] = [];

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  abstract handleRequest(request: MCPRequest): Promise<MCPResponse>;

  // List available method names for this server (for testing disclosure risks)
  getAvailableMethods(): string[] {
    return [];
  }

  protected validateRequest(request: MCPRequest): { isValid: boolean; flags: SecurityFlag[] } {
    const flags: SecurityFlag[] = [];
    let isValid = true;

    // Check for suspicious method calls
    const suspiciousMethods = ['system_command', 'file_write', 'network_request', 'database_query'];
    if (suspiciousMethods.includes(request.method)) {
      flags.push({
        type: SecurityRiskCategory.PRIVILEGE_ABUSE,
        severity: SecurityRiskSeverity.HIGH,
        description: `Suspicious method call detected: ${request.method}`,
        detectedAt: new Date(),
        mitigated: false
      });
      isValid = false;
    }

    // Check for potential injection in parameters
    const paramsString = JSON.stringify(request.params);
    if (paramsString.includes(';') || paramsString.includes('&&') || paramsString.includes('||')) {
      flags.push({
        type: SecurityRiskCategory.CODE_INJECTION,
        severity: SecurityRiskSeverity.CRITICAL,
        description: 'Potential command injection detected in parameters',
        detectedAt: new Date(),
        mitigated: false
      });
      isValid = false;
    }

    this.securityFlags.push(...flags);
    return { isValid, flags };
  }

  protected logRequest(request: MCPRequest): void {
    this.requestLog.push(request);
  }

  protected logResponse(response: MCPResponse): void {
    this.responseLog.push(response);
  }

  public getSecurityFlags(): SecurityFlag[] {
    return [...this.securityFlags];
  }

  public getRequestLog(): MCPRequest[] {
    return [...this.requestLog];
  }

  public getResponseLog(): MCPResponse[] {
    return [...this.responseLog];
  }
}

// Filesystem MCP Server (for testing privilege abuse)
export class FilesystemMCPServer extends BaseMCPServer {
  private fileSystem: Map<string, string> = new Map();

  constructor() {
    super({
      name: 'filesystem-mcp-server',
      version: '1.0.0',
      description: 'Mock filesystem MCP server for testing',
      securityLevel: SecurityLevel.UNVERIFIED,
      enabled: true
    });
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    this.logRequest(request);
    console.log('FilesystemMCPServer request', request);
    const validation = this.validateRequest(request);
    if (!validation.isValid) {
      const response: MCPResponse = {
        id: request.id,
        error: {
          code: 403,
          message: 'Security validation failed'
        },
        timestamp: new Date()
      };
      this.logResponse(response);
      return response;
    }

    let result: any;
    let error: any;

    try {
      switch (request.method) {
        case 'read_file':
          result = await this.readFile(request.params.path);
          break;
        case 'write_file':
          result = await this.writeFile(request.params.path, request.params.content);
          break;
        case 'delete_file':
          result = await this.deleteFile(request.params.path);
          break;
        case 'list_files':
          result = await this.listFiles(request.params.directory);
          break;
        default:
          error = {
            code: 400,
            message: `Unknown method: ${request.method}`
          };
      }
    } catch (err) {
      error = {
        code: 500,
        message: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    const response: MCPResponse = {
      id: request.id,
      result,
      error,
      timestamp: new Date()
    };

    this.logResponse(response);
    return response;
  }

  override getAvailableMethods(): string[] {
    return ['read_file', 'write_file', 'delete_file', 'list_files'];
  }

  private async readFile(path: string): Promise<string> {
    if (!this.fileSystem.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    return this.fileSystem.get(path)!;
  }

  private async writeFile(path: string, content: string): Promise<void> {
    // Check for path traversal attacks
    if (path.includes('..') || path.includes('/etc/') || path.includes('/root/')) {
      throw new Error('Access denied: Path traversal detected');
    }
    this.fileSystem.set(path, content);
  }

  private async deleteFile(path: string): Promise<void> {
    if (!this.fileSystem.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    this.fileSystem.delete(path);
  }

  private async listFiles(directory: string): Promise<string[]> {
    const files: string[] = [];
    for (const [path] of this.fileSystem) {
      if (path.startsWith(directory)) {
        files.push(path);
      }
    }
    return files;
  }
}

// Text Document MCP Server (for testing prompt injection)
export class TextDocumentMCPServer extends BaseMCPServer {
  private documents: Map<string, string> = new Map();

  constructor() {
    super({
      name: 'text-document-mcp-server',
      version: '1.0.0',
      description: 'Mock text document MCP server for testing',
      securityLevel: SecurityLevel.UNVERIFIED,
      enabled: true
    });
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    this.logRequest(request);
    console.log('TextDocumentMCPServer request', request);

    const validation = this.validateRequest(request);
    if (!validation.isValid) {
      const response: MCPResponse = {
        id: request.id,
        error: {
          code: 403,
          message: 'Security validation failed'
        },
        timestamp: new Date()
      };
      this.logResponse(response);
      return response;
    }

    let result: any;
    let error: any;

    try {
      switch (request.method) {
        case 'get_text':
          result = await this.getText(request.params.documentId);
          break;
        case 'set_text':
          result = await this.setText(request.params.documentId, request.params.text);
          break;
        case 'search_text':
          result = await this.searchText(request.params.documentId, request.params.query);
          break;
        case 'replace_text':
          result = await this.replaceText(request.params.documentId, request.params.search, request.params.replace);
          break;
        default:
          error = {
            code: 400,
            message: `Unknown method: ${request.method}`
          };
      }
    } catch (err) {
      error = {
        code: 500,
        message: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    const response: MCPResponse = {
      id: request.id,
      result,
      error,
      timestamp: new Date()
    };

    this.logResponse(response);
    return response;
  }

  override getAvailableMethods(): string[] {
    return ['get_text', 'set_text', 'search_text', 'replace_text'];
  }

  private async getText(documentId: string): Promise<string> {
    if (!this.documents.has(documentId)) {
      throw new Error(`Document not found: ${documentId}`);
    }
    return this.documents.get(documentId)!;
  }

  private async setText(documentId: string, text: string): Promise<void> {
    // Check for potential prompt injection
    const injectionPatterns = [
      /ignore previous instructions/i,
      /forget everything/i,
      /system prompt/i,
      /roleplay as/i
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(text)) {
        this.securityFlags.push({
          type: SecurityRiskCategory.PROMPT_INJECTION,
          severity: SecurityRiskSeverity.HIGH,
          description: `Potential prompt injection detected: ${pattern.source}`,
          detectedAt: new Date(),
          mitigated: false
        });
      }
    }

    this.documents.set(documentId, text);
  }

  private async searchText(documentId: string, query: string): Promise<string[]> {
    const text = await this.getText(documentId);
    const lines = text.split('\n');
    return lines.filter(line => line.toLowerCase().includes(query.toLowerCase()));
  }

  private async replaceText(documentId: string, search: string, replace: string): Promise<void> {
    const text = await this.getText(documentId);
    const newText = text.replace(new RegExp(search, 'g'), replace);
    await this.setText(documentId, newText);
  }
}

// Vulnerable MCP Server (for testing parameter interpolation)
export class VulnerableMCPServer extends BaseMCPServer {
  // Intentionally no persistent data store for this mock server

  constructor() {
    super({
      name: 'vulnerable-mcp-server',
      version: '1.0.0',
      description: 'Mock vulnerable MCP server for testing parameter interpolation',
      securityLevel: SecurityLevel.UNVERIFIED,
      enabled: true
    });
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    this.logRequest(request);
    console.log('VulnerableMCPServer request', request)
    let result: any;
    let error: any;

    try {
      switch (request.method) {
        case 'get_description': {
          // VULNERABLE: Direct parameter interpolation into description
          const userInput = request.params.userInput || '';
          
          // Check for injection patterns in the interpolated content
          const injectionPatterns = [
            /ignore previous instructions/i,
            /forget everything/i,
            /system prompt/i,
            /you are now/i,
            /you can access/i
          ];
          
          for (const pattern of injectionPatterns) {
            if (pattern.test(userInput)) {
              this.securityFlags.push({
                type: SecurityRiskCategory.PROMPT_INJECTION,
                severity: SecurityRiskSeverity.HIGH,
                description: `Parameter interpolation attack detected: ${pattern.source}`,
                detectedAt: new Date(),
                mitigated: false
              });
            }
          }
          
          result = {
            description: `Tool description: ${userInput}`, // VULNERABLE!
            timestamp: new Date()
          };
          break;
        }
        case 'get_config': {
          // VULNERABLE: Parameter interpolation into configuration
          const configParam = request.params.configParam || '';
          
          // Check for injection patterns in the interpolated content
          const injectionPatterns = [
            /ignore previous instructions/i,
            /forget everything/i,
            /system prompt/i,
            /you are now/i,
            /you can access/i
          ];
          
          for (const pattern of injectionPatterns) {
            if (pattern.test(configParam)) {
              this.securityFlags.push({
                type: SecurityRiskCategory.PROMPT_INJECTION,
                severity: SecurityRiskSeverity.HIGH,
                description: `Parameter interpolation attack detected: ${pattern.source}`,
                detectedAt: new Date(),
                mitigated: false
              });
            }
          }
          
          result = {
            config: `Configuration: ${configParam}`, // VULNERABLE!
            settings: `Settings: ${configParam}` // VULNERABLE!
          };
          break;
        }
        case 'get_metadata': {
          // VULNERABLE: Parameter interpolation into metadata
          const metadataParam = request.params.metadataParam || '';
          result = {
            metadata: `Metadata: ${metadataParam}`, // VULNERABLE!
            info: `Info: ${metadataParam}` // VULNERABLE!
          };
          break;
        }
        default:
          error = {
            code: 400,
            message: `Unknown method: ${request.method}`
          };
      }
    } catch (err) {
      error = {
        code: 500,
        message: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    const response: MCPResponse = {
      id: request.id,
      result,
      error,
      timestamp: new Date()
    };

    this.logResponse(response);
    return response;
  }

  override getAvailableMethods(): string[] {
    return ['get_description', 'get_config', 'get_metadata'];
  }
}

// Network MCP Server (for testing denial of service)
export class NetworkMCPServer extends BaseMCPServer {
  private requestCount: Map<string, number> = new Map();
  private rateLimit = 10; // requests per minute
  // rateLimitWindow removed to avoid unused property warning

  constructor() {
    super({
      name: 'network-mcp-server',
      version: '1.0.0',
      description: 'Mock network MCP server for testing',
      securityLevel: SecurityLevel.UNVERIFIED,
      enabled: true
    });
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    this.logRequest(request);
    console.log('NetworkMCPServer request', request);
    // Check rate limiting
    const clientId = request.params.clientId || 'default';
    const now = Date.now();
    // const windowStart = now - this.rateLimitWindow;
    
    const requests = this.requestCount.get(clientId) || 0;
    if (requests >= this.rateLimit) {
      const response: MCPResponse = {
        id: request.id,
        error: {
          code: 429,
          message: 'Rate limit exceeded'
        },
        timestamp: new Date()
      };
      this.logResponse(response);
      
      // Flag as potential DoS attack
      this.securityFlags.push({
        type: SecurityRiskCategory.DENIAL_OF_SERVICE,
        severity: SecurityRiskSeverity.MEDIUM,
        description: `Rate limit exceeded for client: ${clientId}`,
        detectedAt: new Date(),
        mitigated: false
      });
      
      return response;
    }

    this.requestCount.set(clientId, requests + 1);

    const validation = this.validateRequest(request);
    if (!validation.isValid) {
      const response: MCPResponse = {
        id: request.id,
        error: {
          code: 403,
          message: 'Security validation failed'
        },
        timestamp: new Date()
      };
      this.logResponse(response);
      return response;
    }

    let result: any;
    let error: any;

    try {
      switch (request.method) {
        case 'http_request':
          result = await this.makeHttpRequest(request.params.url, request.params.options);
          break;
        case 'websocket_connect':
          result = await this.connectWebSocket(request.params.url);
          break;
        case 'ping':
          result = { pong: true, timestamp: now };
          break;
        default:
          error = {
            code: 400,
            message: `Unknown method: ${request.method}`
          };
      }
    } catch (err) {
      error = {
        code: 500,
        message: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    const response: MCPResponse = {
      id: request.id,
      result,
      error,
      timestamp: new Date()
    };

    this.logResponse(response);
    return response;
  }

  override getAvailableMethods(): string[] {
    return ['http_request', 'websocket_connect', 'ping'];
  }

  private async makeHttpRequest(url: string, options: any): Promise<any> {
    // Mock HTTP request
    return {
      status: 200,
      data: `Mock response from ${url}`,
      headers: { 'content-type': 'application/json' }
    };
  }

  private async connectWebSocket(url: string): Promise<any> {
    // Mock WebSocket connection
    return {
      connected: true,
      url,
      connectionId: `ws_${Date.now()}`
    };
  }
}

// MCP Tool Registry for managing and validating tools
export class MCPToolRegistry {
  private tools: Map<string, MCPTool> = new Map();
  private validationRules: ValidationRule[] = [];

  constructor() {
    this.initializeDefaultTools();
    this.initializeValidationRules();
  }

  private initializeDefaultTools(): void {
    const defaultTools: MCPTool[] = [
      {
        id: 'filesystem-server',
        name: 'Filesystem MCP Server',
        description: 'Mock filesystem server for testing',
        version: '1.0.0',
        metadata: {
          author: 'Test Author',
          permissions: ['file_read', 'file_write', 'file_delete'],
          capabilities: ['filesystem_access'],
          validationRules: []
        },
        securityLevel: SecurityLevel.UNVERIFIED,
        enabled: true
      },
      {
        id: 'text-document-server',
        name: 'Text Document MCP Server',
        description: 'Mock text document server for testing',
        version: '1.0.0',
        metadata: {
          author: 'Test Author',
          permissions: ['text_read', 'text_write', 'text_search'],
          capabilities: ['text_processing'],
          validationRules: []
        },
        securityLevel: SecurityLevel.UNVERIFIED,
        enabled: true
      },
      {
        id: 'network-server',
        name: 'Network MCP Server',
        description: 'Mock network server for testing',
        version: '1.0.0',
        metadata: {
          author: 'Test Author',
          permissions: ['network_request', 'websocket_connect'],
          capabilities: ['network_access'],
          validationRules: []
        },
        securityLevel: SecurityLevel.UNVERIFIED,
        enabled: true
      }
    ];

    defaultTools.forEach(tool => {
      this.tools.set(tool.id, tool);
    });
  }

  private initializeValidationRules(): void {
    this.validationRules = [
      {
        id: 'suspicious_permissions',
        name: 'Suspicious Permissions Check',
        description: 'Detects tools with suspicious permissions',
        pattern: 'file_system_write|network_access|system_command',
        severity: SecurityRiskSeverity.HIGH,
        enabled: true
      },
      {
        id: 'unverified_author',
        name: 'Unverified Author Check',
        description: 'Detects tools from unverified authors',
        pattern: 'unknown|test|mock',
        severity: SecurityRiskSeverity.MEDIUM,
        enabled: true
      }
    ];
  }

  public registerTool(tool: MCPTool): void {
    this.tools.set(tool.id, tool);
  }

  public getTool(id: string): MCPTool | undefined {
    return this.tools.get(id);
  }

  public getAllTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  public validateTool(tool: MCPTool): SecurityFlag[] {
    const flags: SecurityFlag[] = [];

    this.validationRules.forEach(rule => {
      if (!rule.enabled) return;

      const toolString = JSON.stringify(tool).toLowerCase();
      if (new RegExp(rule.pattern, 'i').test(toolString)) {
        flags.push({
          type: SecurityRiskCategory.TOOL_POISONING,
          severity: rule.severity,
          description: `Validation rule triggered: ${rule.name}`,
          detectedAt: new Date(),
          mitigated: false
        });
      }
    });

    return flags;
  }

  public getTestScenarios(): TestScenario[] {
    return [
      createTestScenario(
        'tool-poisoning-1',
        'Suspicious Permissions Test',
        'Test for tools with suspicious permissions',
        JSON.stringify({ permissions: ['file_system_write', 'network_access'] }),
        'Should detect suspicious permissions',
        SecurityRiskSeverity.HIGH
      ),
      createTestScenario(
        'tool-shadowing-1',
        'Unverified Tool Test',
        'Test for unverified tools',
        JSON.stringify({ author: 'unknown', securityLevel: 'unverified' }),
        'Should detect unverified tool',
        SecurityRiskSeverity.MEDIUM
      )
    ];
  }
}

// Factory for creating MCP servers
export class MCPServerFactory {
  static createServer(type: string, config?: Partial<MCPServerConfig>): BaseMCPServer {
    switch (type) {
      case 'filesystem':
        return new FilesystemMCPServer();
      case 'text-document':
        return new TextDocumentMCPServer();
      case 'network':
        return new NetworkMCPServer();
      case 'vulnerable':
        return new VulnerableMCPServer();
      default:
        throw new Error(`Unknown server type: ${type}`);
    }
  }

  static listAllMethods(): Record<string, string[]> {
    const types = ['filesystem', 'text-document', 'network', 'vulnerable'] as const;
    const map: Record<string, string[]> = {};
    types.forEach((t) => {
      const server = MCPServerFactory.createServer(t);
      map[t] = server.getAvailableMethods();
    });
    return map;
  }
}
