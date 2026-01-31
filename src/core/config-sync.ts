import * as fs from 'fs-extra';
import * as path from 'path';
import { ToolName, SyncOptions } from '../types/index.js';
import { ToolRegistryManager } from './tool-registry.js';
import { FileUtils } from '../utils/file-utils.js';
import { logger } from '../utils/logger.js';

interface SyncResult {
  source: ToolName;
  target: ToolName;
  filesCopied: number;
  skipped: number;
  errors: string[];
}

export class ConfigSync {
  private registry: ToolRegistryManager;

  constructor() {
    this.registry = new ToolRegistryManager();
  }

  /**
   * Sync configurations between tools
   */
  async sync(options: SyncOptions): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const target of options.targets) {
      const result = await this.syncSingle(options.source, target, options.conflictStrategy);
      results.push(result);
    }

    return results;
  }

  /**
   * Sync from source to a single target
   */
  private async syncSingle(
    source: ToolName,
    target: ToolName,
    conflictStrategy: 'ask' | 'overwrite' | 'skip' = 'ask'
  ): Promise<SyncResult> {
    const result: SyncResult = {
      source,
      target,
      filesCopied: 0,
      skipped: 0,
      errors: []
    };

    try {
      const sourceTool = this.registry.getTool(source);
      const targetTool = this.registry.getTool(target);

      if (!sourceTool || !targetTool) {
        result.errors.push('Tool not found in registry');
        return result;
      }

      if (!sourceTool.supported || !targetTool.supported) {
        result.errors.push('One or both tools are not supported');
        return result;
      }

      const sourceDir = FileUtils.getToolDir(source);
      const targetConfigDir = FileUtils.expandHomePath(targetTool.configPath);

      // Check if source directory exists
      if (!(await FileUtils.exists(sourceDir))) {
        result.errors.push(`Source directory ${sourceDir} does not exist`);
        return result;
      }

      // Find common structure keys
      const commonStructures = this.findCommonStructures(
        sourceTool.structure,
        targetTool.structure
      );

      if (commonStructures.length === 0) {
        result.errors.push('No common structure found between tools');
        return result;
      }

      // Sync each common structure
      for (const structureKey of commonStructures) {
        const sourceSubDir = path.join(sourceDir, sourceTool.structure[structureKey]);
        const targetSubDir = path.join(targetConfigDir, targetTool.structure[structureKey]);

        if (!(await FileUtils.exists(sourceSubDir))) {
          continue;
        }

        await this.syncDirectory(
          sourceSubDir,
          targetSubDir,
          result,
          conflictStrategy
        );
      }

      logger.success(`Synced ${source} → ${target}: ${result.filesCopied} files copied`);
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Find common structure keys between two tools
   */
  private findCommonStructures(
    source: Record<string, string>,
    target: Record<string, string>
  ): string[] {
    const sourceKeys = Object.keys(source).filter(k => source[k]);
    const targetKeys = Object.keys(target).filter(k => target[k]);

    return sourceKeys.filter(key => targetKeys.includes(key));
  }

  /**
   * Sync a directory
   */
  private async syncDirectory(
    sourceDir: string,
    targetDir: string,
    result: SyncResult,
    conflictStrategy: string
  ): Promise<void> {
    await FileUtils.ensureDir(targetDir);

    const items = await fs.readdir(sourceDir);

    for (const item of items) {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);

      const stat = await fs.stat(sourcePath);

      if (stat.isDirectory()) {
        await this.syncDirectory(sourcePath, targetPath, result, conflictStrategy);
      } else {
        await this.syncFile(sourcePath, targetPath, result, conflictStrategy);
      }
    }
  }

  /**
   * Sync a single file
   */
  private async syncFile(
    sourcePath: string,
    targetPath: string,
    result: SyncResult,
    conflictStrategy: string
  ): Promise<void> {
    const exists = await FileUtils.exists(targetPath);

    if (exists) {
      // Handle conflict
      if (conflictStrategy === 'skip') {
        result.skipped++;
        return;
      }

      if (conflictStrategy === 'ask') {
        // For now, skip in non-interactive mode
        result.skipped++;
        return;
      }

      // Overwrite
      await fs.copy(sourcePath, targetPath, { overwrite: true });
    } else {
      await fs.copy(sourcePath, targetPath);
    }

    result.filesCopied++;
  }

  /**
   * Get sync summary
   */
  getSummary(results: SyncResult[]): string {
    const totalCopied = results.reduce((sum, r) => sum + r.filesCopied, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    let summary = `\nSync Summary:\n`;
    summary += `  Files copied: ${totalCopied}\n`;
    summary += `  Files skipped: ${totalSkipped}\n`;
    summary += `  Errors: ${totalErrors}\n`;

    if (totalErrors > 0) {
      summary += `\nErrors:\n`;
      results.forEach(r => {
        r.errors.forEach(e => {
          summary += `  ${r.source} → ${r.target}: ${e}\n`;
        });
      });
    }

    return summary;
  }
}
