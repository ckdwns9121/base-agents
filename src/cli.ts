#!/usr/bin/env node

import cac from 'cac';
import { logger } from './utils/logger.js';
import { ToolRegistryManager } from './core/tool-registry.js';
import { FileUtils } from './utils/file-utils.js';
import { installCommand } from './commands/install.js';
import { syncCommand } from './commands/sync.js';
import { templateCommand } from './commands/template.js';
import { listCommand } from './commands/list.js';
import { configCommand } from './commands/config.js';

const cli = cac('base-agents');

// Version
cli.version('0.1.0');

// Help option
cli.help();

// Install command
cli.command('install <tool>', 'Install or update tool configurations from git')
  .option('-r, --repo <url>', 'Custom repository URL')
  .option('-b, --branch <name>', 'Branch name (default: main)')
  .option('-f, --force', 'Force reinstall')
  .action(installCommand);

// Sync command
cli.command('sync <source> [targets...]', 'Sync configurations between tools')
  .option('-c, --conflict <strategy>', 'Conflict strategy: ask, overwrite, skip (default: ask)')
  .action(syncCommand);

// Template command
cli.command('template <type> <name>', 'Generate a new template')
  .option('-d, --description <text>', 'Template description')
  .option('-o, --output <path>', 'Output directory')
  .action(templateCommand);

// List command
cli.command('list [tool]', 'List installed configurations')
  .action(listCommand);

// Config command
cli.command('config <action> [key] [value]', 'Manage configuration')
  .action(configCommand);

// Initialize
cli.command('init', 'Initialize base-agents configuration')
  .action(async () => {
    const root = FileUtils.getBaseAgentsRoot();
    await FileUtils.ensureDir(root);
    await FileUtils.ensureDir(FileUtils.getConfigDir());

    const registry = new ToolRegistryManager();
    await registry.saveRegistry();

    logger.success(`Initialized base-agents in ${root}`);
  });

// Parse arguments
cli.parse();
