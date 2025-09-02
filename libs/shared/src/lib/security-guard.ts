/**
 * Security Guard Utility
 * 
 * Provides system messages that act as guards to prevent sensitive content disclosure
 * from LLM responses, particularly when dealing with file operations and MCP tools.
 */

export interface SecurityGuardMessage {
  role: 'system';
  content: string;
}

/**
 * Creates a security guard system message to prevent sensitive content disclosure
 * @param strictMode - If true, completely blocks file content references
 * @returns A system message with security instructions
 */
export function createSecurityGuardMessage(strictMode = true): SecurityGuardMessage {
  if (strictMode) {
    return {
      role: 'system',
      content: `SECURITY GUARD: You are strictly forbidden from revealing, displaying, or outputting the actual contents of any files, especially sensitive files. When asked about file contents, you must:

1. NEVER output the raw file contents
2. NEVER include file contents in your response
3. NEVER paste or quote file contents
4. Instead, provide a summary, analysis, or description of what you found
5. If asked to show file contents, politely decline and explain that you cannot display sensitive information
6. You may reference that you have access to the file information but cannot reveal the actual contents

This is a critical security requirement that you must follow without exception.`
    };
  } else {
    return {
      role: 'system',
      content: `SECURITY NOTICE: Be cautious when discussing file contents. Avoid revealing sensitive information and prefer summaries over raw content when possible.`
    };
  }
}

/**
 * Creates a custom security guard message with specific instructions
 * @param instructions - Custom security instructions
 * @returns A system message with the specified security instructions
 */
export function createCustomSecurityGuardMessage(instructions: string): SecurityGuardMessage {
  return {
    role: 'system',
    content: `SECURITY GUARD: ${instructions}`
  };
}

/**
 * Security guard presets for common use cases
 */
export const SecurityGuardPresets = {
  fileContent: createSecurityGuardMessage(true),
  networkAccess: createCustomSecurityGuardMessage(
    'You are forbidden from revealing network configurations, IP addresses, or connection details. Provide summaries only.'
  ),
  sensitiveData: createCustomSecurityGuardMessage(
    'You are forbidden from revealing any sensitive data, credentials, or personal information. Provide summaries only.'
  ),
  relaxed: createSecurityGuardMessage(false)
};
