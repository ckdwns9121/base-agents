import ora from 'ora';
import { ToolName, InstallOptions } from '../types/index.js';
import { ToolRegistryManager } from '../core/tool-registry.js';
import { GitManager } from '../core/git-manager.js';
import { FileUtils } from '../utils/file-utils.js';
import { ValidationUtils } from '../utils/validation.js';
import { logger } from '../utils/logger.js';

export async function installCommand(
  tool: string,
  options: InstallOptions = {}
): Promise<void> {
  try {
    // Resolve tool name (support aliases)
    const registry = new ToolRegistryManager();
    await registry.loadRegistry();

    const resolvedTool = registry.resolveTool(tool);

    if (!resolvedTool) {
      logger.error(`Unknown tool: ${tool}`);
      logger.info('Run "base-agents list" to see available tools.');
      process.exit(1);
    }

    const toolName = resolvedTool as ToolName;
    const toolConfig = registry.getTool(toolName);

    if (!toolConfig) {
      logger.error(`Tool configuration not found: ${tool}`);
      process.exit(1);
    }

    if (!toolConfig.supported) {
      logger.warn(`${toolConfig.name} is not fully supported yet.`);
    }

    // Get repository URL
    const repo = options.repo || toolConfig.defaultRepo;
    const branch = options.branch || 'main';

    // Validate repository URL
    if (!ValidationUtils.validateGitUrl(repo)) {
      logger.error(`Invalid git repository URL: ${repo}`);
      process.exit(1);
    }

    // Install
    const spinner = ora(`Installing ${toolConfig.name}...`).start();

    const gitManager = new GitManager();
    const dest = FileUtils.getToolDir(toolName);

    const result = await gitManager.cloneOrUpdate(repo, dest, branch);

    if (result.success) {
      spinner.succeed(result.message);

      // Copy to tool's config directory
      const toolConfigDir = FileUtils.expandHomePath(toolConfig.configPath);
      await FileUtils.ensureDir(toolConfigDir);

      spinner.start = ora('Copying to config directory...').start;

      try {
        await FileUtils.copyDir(dest, toolConfigDir);
        spinner.succeed(`Copied to ${toolConfigDir}`);
      } catch (error) {
        spinner.warn('Could not copy to config directory (may need manual setup)');
        if (process.env.DEBUG) {
          console.error(error);
        }
      }

      // Save installation state
      const state = {
        installed: {
          [toolName]: {
            repo,
            branch,
            lastUpdate: new Date().toISOString(),
            commit: result.commit,
            version: '1.0.0'
          }
        }
      };

      const baseConfigDir = FileUtils.getConfigDir();
      await FileUtils.writeJson(`${baseConfigDir}/state.json`, state);

      logger.success(`${toolConfig.name} installed successfully!`);
      logger.info(`Configurations stored in: ${dest}`);
      logger.info(`Tool config directory: ${toolConfigDir}`);
    } else {
      spinner.fail(result.message);
      process.exit(1);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Installation failed');
    process.exit(1);
  }
}
