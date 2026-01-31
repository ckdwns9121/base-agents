import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export class FileUtils {
  /**
   * Expand tilde (~) to home directory
   */
  static expandHomePath(filepath: string): string {
    if (filepath.startsWith('~/') || filepath === '~') {
      return filepath.replace('~', os.homedir());
    }
    return filepath;
  }

  /**
   * Get the base-agents root directory
   */
  static getBaseAgentsRoot(): string {
    const root = process.env.BASE_AGENTS_ROOT || path.join(os.homedir(), '.base-agents');
    return this.expandHomePath(root);
  }

  /**
   * Ensure directory exists, create if not
   */
  static async ensureDir(dir: string): Promise<void> {
    await fs.ensureDir(dir);
  }

  /**
   * Check if path exists
   */
  static async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read JSON file
   */
  static async readJson<T = any>(filepath: string): Promise<T | null> {
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Write JSON file with pretty format
   */
  static async writeJson(filepath: string, data: any): Promise<void> {
    await this.ensureDir(path.dirname(filepath));
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Copy directory recursively
   */
  static async copyDir(src: string, dest: string): Promise<void> {
    await fs.copy(src, dest, { overwrite: true });
  }

  /**
   * Delete directory recursively
   */
  static async removeDir(dir: string): Promise<void> {
    await fs.remove(dir);
  }

  /**
   * Get tool directory path
   */
  static getToolDir(toolName: string): string {
    return path.join(this.getBaseAgentsRoot(), toolName);
  }

  /**
   * Get config directory path
   */
  static getConfigDir(): string {
    return path.join(this.getBaseAgentsRoot(), '.config');
  }

  /**
   * List directories in a path
   */
  static async listDirs(dir: string): Promise<string[]> {
    const exists = await this.exists(dir);
    if (!exists) return [];

    const items = await fs.readdir(dir);
    const stats = await Promise.all(
      items.map(async (item) => ({
        name: item,
        stat: await fs.stat(path.join(dir, item))
      }))
    );

    return stats
      .filter(({ stat }) => stat.isDirectory())
      .map(({ name }) => name);
  }
}
