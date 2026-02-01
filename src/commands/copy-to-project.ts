import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs-extra';
import { logger } from '../utils/logger.js';

interface CopyOptions {
  skills?: boolean;
  rules?: boolean;
  agents?: boolean;
  mcp?: boolean;
  all?: boolean;
  target?: string;
}

export async function copyToProjectCommand(options: CopyOptions = {}): Promise<void> {
  try {
    const spinner = ora('Copying to project...').start();

    // 현재 작업 디렉토리가 프로젝트 루트라고 가정
    const projectRoot = process.cwd();

    // base-agents 레포지토리 위치 (환경 변수 또는 기본값)
    const ssotRoot = process.env.BASE_AGENTS_SSOT || path.join(process.env.HOME || '', 'Desktop', 'base-agents');

    // 무엇을 복사할지 결정
    const copyAll = options.all || Object.keys(options).length === 0;
    const copySkills = copyAll || options.skills;
    const copyRules = copyAll || options.rules;
    const copyAgents = copyAll || options.agents;
    const copyMcp = copyAll || options.mcp;

    let copiedCount = 0;

    // Skills 복사
    if (copySkills) {
      await copyDirectory(
        path.join(ssotRoot, 'skills'),
        path.join(projectRoot, '.claude', 'skills'),
        spinner
      );
      await copyDirectory(
        path.join(ssotRoot, 'skills'),
        path.join(projectRoot, '.cursor', 'skills'),
        spinner
      );
      copiedCount++;
    }

    // Rules 복사
    if (copyRules) {
      await copyDirectory(
        path.join(ssotRoot, 'rules'),
        path.join(projectRoot, '.cursor', 'rules'),
        spinner
      );
      await copyDirectory(
        path.join(ssotRoot, 'rules'),
        path.join(projectRoot, '.claude', 'rules'),
        spinner
      );
      copiedCount++;
    }

    // Agents 복사
    if (copyAgents) {
      await copyDirectory(
        path.join(ssotRoot, 'agents'),
        path.join(projectRoot, '.claude', 'agents'),
        spinner
      );
      copiedCount++;
    }

    // MCP 복사
    if (copyMcp) {
      await copyDirectory(
        path.join(ssotRoot, 'mcp'),
        path.join(projectRoot, '.claude', 'mcp'),
        spinner
      );
      copiedCount++;
    }

    spinner.succeed(`Copied ${copiedCount} categories to project`);

    logger.info(`Project root: ${projectRoot}`);
    logger.info('Created directories:');
    if (copySkills) logger.info('  - .claude/skills/, .cursor/skills/');
    if (copyRules) logger.info('  - .cursor/rules/, .claude/rules/');
    if (copyAgents) logger.info('  - .claude/agents/');
    if (copyMcp) logger.info('  - .claude/mcp/');

  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Copy failed');
    process.exit(1);
  }
}

async function copyDirectory(
  source: string,
  dest: string,
  spinner: any
): Promise<void> {
  try {
    const exists = await fs.pathExists(source);

    if (!exists) {
      spinner.warn(`Source not found: ${source}`);
      return;
    }

    // 대상 디렉토리 생성
    await fs.ensureDir(dest);

    // 파일 복사 (README 제외)
    const files = await fs.readdir(source);

    for (const file of files) {
      if (file === 'README.md') continue;

      const srcPath = path.join(source, file);
      const destPath = path.join(dest, file);
      const stat = await fs.stat(srcPath);

      if (stat.isDirectory()) {
        await fs.copy(srcPath, destPath, { overwrite: true });
      } else {
        await fs.copy(srcPath, destPath, { overwrite: true });
      }
    }

    spinner.succeed(`Copied: ${path.basename(dest)}`);
  } catch (error) {
    throw new Error(`Failed to copy ${source}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
