import chalk from 'chalk';

export class Logger {
  private silent: boolean;

  constructor(silent = false) {
    this.silent = silent;
  }

  info(message: string): void {
    if (!this.silent) {
      console.log(chalk.blue('ℹ'), message);
    }
  }

  success(message: string): void {
    if (!this.silent) {
      console.log(chalk.green('✓'), message);
    }
  }

  error(message: string): void {
    if (!this.silent) {
      console.error(chalk.red('✗'), message);
    }
  }

  warn(message: string): void {
    if (!this.silent) {
      console.warn(chalk.yellow('⚠'), message);
    }
  }

  debug(message: string): void {
    if (!this.silent && process.env.DEBUG) {
      console.log(chalk.gray('›'), message);
    }
  }

  step(message: string): void {
    if (!this.silent) {
      console.log(chalk.cyan('→'), message);
    }
  }

  title(title: string): void {
    if (!this.silent) {
      console.log('\n' + chalk.bold.cyan(title));
    }
  }

  newline(): void {
    if (!this.silent) {
      console.log('');
    }
  }
}

export const logger = new Logger();
