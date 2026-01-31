// Tool types
export type ToolName = 'claude' | 'gemini' | 'cursor' | 'opencode' | 'agents';

export interface ToolStructure {
  [key: string]: string; // e.g., "skills": "skills", "agents": "agents"
}

export interface ToolConfig {
  name: string;
  defaultRepo: string;
  configPath: string;
  structure: ToolStructure;
  fileTypes: string[];
  supported: boolean;
}

export interface ToolRegistry {
  tools: Record<ToolName, ToolConfig>;
  aliases: Record<string, string[]>;
}

// Installation state
export interface InstallationInfo {
  repo: string;
  branch: string;
  lastUpdate: string;
  commit: string;
  version?: string;
}

export interface InstallationState {
  installed: Record<string, InstallationInfo>;
  templates: {
    skills: string[];
    agents: string[];
    mcp: string[];
  };
}

// User configuration
export interface UserConfig {
  preferences: {
    defaultBranch: string;
    autoUpdate: boolean;
    updateInterval: string;
  };
  paths: {
    root: string;
    cache: string;
    temp: string;
  };
  git: {
    depth: number;
    singleBranch: boolean;
  };
  sync: {
    enabled: boolean;
    conflictStrategy: 'ask' | 'overwrite' | 'skip';
  };
}

// Template types
export type TemplateType = 'skill' | 'agent' | 'mcp' | 'command';

export interface TemplateOptions {
  name: string;
  description?: string;
  author?: string;
  tags?: string[];
}

// Sync types
export interface SyncOptions {
  source: ToolName;
  targets: ToolName[];
  conflictStrategy?: 'ask' | 'overwrite' | 'skip';
}

// Git operation results
export interface GitResult {
  success: boolean;
  message: string;
  commit?: string;
  branch?: string;
}

// Command options
export interface InstallOptions {
  repo?: string;
  branch?: string;
  force?: boolean;
}

export interface SyncCommandOptions {
  source: ToolName;
  targets: ToolName[];
}

export interface TemplateCommandOptions {
  type: TemplateType;
  name: string;
  description?: string;
  output?: string;
}
