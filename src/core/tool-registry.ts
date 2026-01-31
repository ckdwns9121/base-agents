import { ToolName, ToolConfig, ToolRegistry } from '../types/index.js';
import { FileUtils } from '../utils/file-utils.js';

export class ToolRegistryManager {
  private registry: ToolRegistry;

  constructor() {
    this.registry = this.getDefaultRegistry();
  }

  /**
   * Get default tool registry
   */
  private getDefaultRegistry(): ToolRegistry {
    return {
      tools: {
        claude: {
          name: 'Claude Code',
          defaultRepo: 'https://github.com/anthropics/claude-code-configuration',
          configPath: '~/.claude',
          structure: {
            skills: 'skills',
            agents: 'agents',
            commands: 'commands',
            mcp: 'mcp'
          },
          fileTypes: ['.md', '.json'],
          supported: true
        },
        cursor: {
          name: 'Cursor IDE',
          defaultRepo: 'https://github.com/PatrickJS/awesome-cursorrules',
          configPath: '~/.cursor/rules',
          structure: {
            rules: ''
          },
          fileTypes: ['.cursorrules', '.md'],
          supported: true
        },
        gemini: {
          name: 'Gemini Code Assist',
          defaultRepo: 'https://github.com/google/gemini-code-assist-configs',
          configPath: '~/.config/google-gemini-code-assist',
          structure: {
            agents: 'agents',
            skills: 'skills'
          },
          fileTypes: ['.md'],
          supported: true
        },
        opencode: {
          name: 'OpenCode',
          defaultRepo: 'https://github.com/opencode/opencode-configs',
          configPath: '~/.opencode',
          structure: {
            skills: 'skills',
            agents: 'agents',
            rules: 'rules'
          },
          fileTypes: ['.md', '.json'],
          supported: false // Not fully implemented yet
        },
        agents: {
          name: 'Agents',
          defaultRepo: 'https://github.com/base-agents/agents-configs',
          configPath: '~/.agents',
          structure: {
            agents: 'agents',
            skills: 'skills',
            prompts: 'prompts'
          },
          fileTypes: ['.md', '.json'],
          supported: true
        }
      },
      aliases: {
        claude: ['.claude', 'claude-code', 'anthropic'],
        cursor: ['.cursor', 'cursor-ide'],
        gemini: ['.gemini', 'gemini-code', 'google'],
        opencode: ['.opencode', 'open-code'],
        agents: ['.agents', 'agent']
      }
    };
  }

  /**
   * Get all tools
   */
  getAllTools(): Record<ToolName, ToolConfig> {
    return this.registry.tools;
  }

  /**
   * Get a specific tool configuration
   */
  getTool(toolName: ToolName): ToolConfig | null {
    return this.registry.tools[toolName] || null;
  }

  /**
   * Get aliases for a tool
   */
  getAliases(toolName: ToolName): string[] {
    return this.registry.aliases[toolName] || [];
  }

  /**
   * Resolve tool name from alias
   */
  resolveTool(name: string): ToolName | null {
    // Direct match
    if (name in this.registry.tools) {
      return name as ToolName;
    }

    // Alias match
    for (const [tool, aliases] of Object.entries(this.registry.aliases)) {
      if (aliases.includes(name)) {
        return tool as ToolName;
      }
    }

    return null;
  }

  /**
   * Check if a tool is supported
   */
  isSupported(toolName: ToolName): boolean {
    const tool = this.getTool(toolName);
    return tool ? tool.supported : false;
  }

  /**
   * Get all supported tools
   */
  getSupportedTools(): ToolName[] {
    return Object.entries(this.registry.tools)
      .filter(([_, config]) => config.supported)
      .map(([name]) => name as ToolName);
  }

  /**
   * Get tool storage directory
   */
  getToolDir(toolName: ToolName): string {
    return FileUtils.getToolDir(toolName);
  }

  /**
   * Get tool config path (where the tool actually reads from)
   */
  getToolConfigPath(toolName: ToolName): string {
    const tool = this.getTool(toolName);
    if (!tool) return '';
    return FileUtils.expandHomePath(tool.configPath);
  }

  /**
   * Save registry to file
   */
  async saveRegistry(): Promise<void> {
    const configDir = FileUtils.getConfigDir();
    await FileUtils.ensureDir(configDir);

    const registryPath = `${configDir}/registry.json`;
    await FileUtils.writeJson(registryPath, this.registry);
  }

  /**
   * Load registry from file
   */
  async loadRegistry(): Promise<ToolRegistry | null> {
    const configDir = FileUtils.getConfigDir();
    const registryPath = `${configDir}/registry.json`;

    const loaded = await FileUtils.readJson<ToolRegistry>(registryPath);
    if (loaded) {
      this.registry = loaded;
    }

    return loaded;
  }

  /**
   * Update tool repository URL
   */
  updateToolRepo(toolName: ToolName, repoUrl: string): boolean {
    const tool = this.registry.tools[toolName];
    if (!tool) return false;

    tool.defaultRepo = repoUrl;
    return true;
  }

  /**
   * Add a new tool
   */
  addTool(toolName: string, config: ToolConfig): void {
    (this.registry.tools as any)[toolName] = config;
  }
}
