import ora from 'ora';
import { ToolName } from '../types/index.js';
import { ConfigSync } from '../core/config-sync.js';
import { ToolRegistryManager } from '../core/tool-registry.js';
import { logger } from '../utils/logger.js';

export async function syncCommand(
  source: string,
  targets: string[] = [],
  options?: { conflict?: 'ask' | 'overwrite' | 'skip' }
): Promise<void> {
  try {
    // Debug logging
    console.log('DEBUG source:', source);
    console.log('DEBUG targets:', targets);
    console.log('DEBUG targets type:', typeof targets);
    console.log('DEBUG isArray:', Array.isArray(targets));

    // Handle case where targets might be undefined or not an array
    if (!Array.isArray(targets)) {
      // If targets is not an array, it might be the options object
      if (typeof targets === 'object' && targets !== null) {
        options = targets as any;
        targets = [];
      }
    }

    const registry = new ToolRegistryManager();
    await registry.loadRegistry();

    // Resolve source tool
    const resolvedSource = registry.resolveTool(source);
    if (!resolvedSource) {
      logger.error(`Unknown source tool: ${source}`);
      process.exit(1);
    }

    // Resolve target tools
    const resolvedTargets = targets.map(t => {
      const resolved = registry.resolveTool(t);
      if (!resolved) {
        logger.error(`Unknown target tool: ${t}`);
        process.exit(1);
      }
      return resolved as ToolName;
    });

    if (resolvedTargets.length === 0) {
      logger.error('At least one target tool is required');
      logger.info('Usage: base-agents sync <source> <target1> [target2...]');
      process.exit(1);
    }

    const spinner = ora('Syncing configurations...').start();

    const sync = new ConfigSync();
    const results = await sync.sync({
      source: resolvedSource as ToolName,
      targets: resolvedTargets,
      conflictStrategy: options?.conflict || 'ask'
    });

    spinner.succeed('Sync completed');

    console.log(sync.getSummary(results));
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Sync failed');
    process.exit(1);
  }
}
