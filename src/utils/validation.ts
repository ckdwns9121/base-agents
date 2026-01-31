import { ToolName } from '../types/index.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ValidationUtils {
  /**
   * Validate tool name
   */
  static validateToolName(tool: string): tool is ToolName {
    const validTools: ToolName[] = ['claude', 'gemini', 'cursor', 'opencode', 'agents'];
    if (!validTools.includes(tool as ToolName)) {
      throw new ValidationError(
        `Invalid tool "${tool}". Valid tools are: ${validTools.join(', ')}`
      );
    }
    return true;
  }

  /**
   * Validate GitHub URL
   */
  static validateGitUrl(url: string): boolean {
    const gitUrlPatterns = [
      /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\.git$/,
      /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/,
      /^git@github\.com:[\w-]+\/[\w.-]+\.git$/,
      /^https?:\/\/.+\.(git|zip)$/,
    ];

    return gitUrlPatterns.some((pattern) => pattern.test(url));
  }

  /**
   * Validate branch name
   */
  static validateBranchName(branch: string): boolean {
    // Git branch name rules
    const branchPattern = /^(?!\/)(?!.*\/\.|.*\.\.|.*\/\.$)(?!.*\.\d+$)[\w\-./]+$/;
    return branchPattern.test(branch);
  }

  /**
   * Validate template name
   */
  static validateTemplateName(name: string): boolean {
    // Should be kebab-case
    const kebabCasePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return kebabCasePattern.test(name);
  }

  /**
   * Sanitize template name to kebab-case
   */
  static sanitizeTemplateName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Validate and return tool name with alias support
   */
  static resolveToolName(tool: string, aliases: Record<string, string[]>): ToolName {
    // Direct match
    if (this.validateToolName(tool)) {
      return tool as ToolName;
    }

    // Alias match
    for (const [canonicalTool, aliasList] of Object.entries(aliases)) {
      if (aliasList.includes(tool)) {
        return canonicalTool as ToolName;
      }
    }

    throw new ValidationError(
      `Unknown tool or alias "${tool}". Use "base-agents list" to see available tools.`
    );
  }

  /**
   * Validate file path safety
   */
  static validatePathSafety(path: string): boolean {
    // Prevent directory traversal
    const normalizedPath = path.replace(/\\/g, '/');
    return !normalizedPath.includes('..') && !normalizedPath.startsWith('/');
  }
}
