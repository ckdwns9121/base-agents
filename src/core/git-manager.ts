import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import { FileUtils } from '../utils/file-utils.js';
import { GitResult } from '../types/index.js';

export class GitManager {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  /**
   * Clone or update a git repository
   */
  async cloneOrUpdate(
    repoUrl: string,
    dest: string,
    branch: string = 'main'
  ): Promise<GitResult> {
    try {
      const exists = await FileUtils.exists(dest);

      if (exists) {
        // Update existing repository
        return await this.updateRepo(dest, branch);
      } else {
        // Clone new repository
        return await this.cloneRepo(repoUrl, dest, branch);
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clone a new repository
   */
  private async cloneRepo(
    repoUrl: string,
    dest: string,
    branch: string
  ): Promise<GitResult> {
    try {
      await FileUtils.ensureDir(path.dirname(dest));

      await this.git.clone(repoUrl, dest, [
        '--branch',
        branch,
        '--depth',
        '1',
        '--single-branch'
      ]);

      // Get latest commit info
      const gitRepo = simpleGit(dest);
      const log = await gitRepo.log({ maxCount: 1 });

      return {
        success: true,
        message: `Successfully cloned ${repoUrl}`,
        commit: log.latest?.hash,
        branch
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update an existing repository
   */
  private async updateRepo(dest: string, branch: string): Promise<GitResult> {
    try {
      const gitRepo = simpleGit(dest);

      // Fetch latest changes
      await gitRepo.fetch('origin', branch);

      // Get current commit
      const currentLog = await gitRepo.log({ maxCount: 1 });
      const currentCommit = currentLog.latest?.hash;

      // Pull latest changes
      await gitRepo.pull('origin', branch);

      // Get new commit
      const newLog = await gitRepo.log({ maxCount: 1 });

      return {
        success: true,
        message: currentCommit === newLog.latest?.hash
          ? 'Already up to date'
          : 'Successfully updated',
        commit: newLog.latest?.hash,
        branch
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update repository: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get the latest commit hash
   */
  async getLatestCommit(repoPath: string): Promise<string | null> {
    try {
      const gitRepo = simpleGit(repoPath);
      const log = await gitRepo.log({ maxCount: 1 });
      return log.latest?.hash || null;
    } catch {
      return null;
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(repoPath: string): Promise<string | null> {
    try {
      const gitRepo = simpleGit(repoPath);
      const branches = await gitRepo.branch();
      return branches.current || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if a directory is a git repository
   */
  async isGitRepo(dir: string): Promise<boolean> {
    try {
      const gitDir = path.join(dir, '.git');
      return await FileUtils.exists(gitDir);
    } catch {
      return false;
    }
  }
}
