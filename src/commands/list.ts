import { ToolName } from '../types/index.js';
import { ToolRegistryManager } from '../core/tool-registry.js';
import { FileUtils } from '../utils/file-utils.js';
import { logger } from '../utils/logger.js';
import chalk from 'chalk';

export async function listCommand(tool?: string): Promise<void> {
  const registry = new ToolRegistryManager();
  await registry.loadRegistry();

  if (tool) {
    // List specific tool
    await listTool(tool, registry);
  } else {
    // List all tools
    await listAllTools(registry);
  }
}

async function listTool(toolName: string, registry: ToolRegistryManager): Promise<void> {
  const resolved = registry.resolveTool(toolName);

  if (!resolved) {
    logger.error(`Unknown tool: ${toolName}`);
    process.exit(1);
  }

  const tool = registry.getTool(resolved as ToolName);
  if (!tool) return;

  logger.title(`${tool.name} (${resolved})`);
  console.log(`Repository: ${tool.defaultRepo}`);
  console.log(`Config Path: ${tool.configPath}`);
  console.log(`Supported: ${tool.supported ? chalk.green('Yes') : chalk.red('No')}`);
  console.log(`File Types: ${tool.fileTypes.join(', ')}`);
  console.log(`\nStructure:`);

  for (const [key, value] of Object.entries(tool.structure)) {
    console.log(`  ${key}: ${value || '(root)'}`);
  }

  // Check installation status
  const toolDir = FileUtils.getToolDir(resolved as ToolName);
  const installed = await FileUtils.exists(toolDir);

  console.log(`\nInstalled: ${installed ? chalk.green('Yes') : chalk.red('No')}`);
  if (installed) {
    console.log(`Location: ${toolDir}`);
  }
}

async function listAllTools(registry: ToolRegistryManager): Promise<void> {
  const tools = registry.getAllTools();
  const supported = registry.getSupportedTools();

  logger.title('Available Tools');

  for (const [name, config] of Object.entries(tools)) {
    const isSupported = config.supported;
    const status = isSupported ? chalk.green('✓') : chalk.gray('○');

    console.log(`\n${status} ${chalk.bold(config.name)} (${name})`);

    if (!isSupported) {
      console.log(chalk.gray('  (Coming soon)'));
    }

    console.log(`  Repo: ${config.defaultRepo}`);
    console.log(`  Config: ${config.configPath}`);

    // Aliases
    const aliases = registry.getAliases(name as ToolName);
    if (aliases.length > 0) {
      console.log(`  Aliases: ${aliases.join(', ')}`);
    }

    // Installation status
    const toolDir = FileUtils.getToolDir(name as ToolName);
    const installed = await FileUtils.exists(toolDir);
    if (installed) {
      console.log(chalk.green(`  ✓ Installed in ${toolDir}`));
    }
  }

  console.log(`\n${chalk.bold('Summary:')} ${supported.length}/${Object.keys(tools).length} tools supported`);
}
