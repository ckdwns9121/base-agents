import ora from 'ora';
import { TemplateType, TemplateCommandOptions } from '../types/index.js';
import { TemplateEngine } from '../core/template-engine.js';
import { ValidationUtils } from '../utils/validation.js';
import { logger } from '../utils/logger.js';

export async function templateCommand(
  type: string,
  name: string,
  options: Omit<TemplateCommandOptions, 'type' | 'name'> = {}
): Promise<void> {
  try {
    // Validate template type
    const validTypes: TemplateType[] = ['skill', 'agent', 'mcp', 'command'];
    if (!validTypes.includes(type as TemplateType)) {
      logger.error(`Invalid template type: ${type}`);
      logger.info(`Valid types are: ${validTypes.join(', ')}`);
      process.exit(1);
    }

    // Validate and sanitize name
    if (!ValidationUtils.validateTemplateName(name)) {
      logger.warn(`Template name should be kebab-case. Sanitizing...`);
      name = ValidationUtils.sanitizeTemplateName(name);
    }

    const templateType = type as TemplateType;
    const spinner = ora(`Generating ${type} template...`).start();

    const engine = new TemplateEngine();
    const result = await engine.generate({
      type: templateType,
      name,
      description: options.description,
      output: options.output
    });

    if (result.success) {
      spinner.succeed(result.message);
      logger.info(`Template created at: ${result.path}`);
    } else {
      spinner.fail(result.message);
      process.exit(1);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Template generation failed');
    process.exit(1);
  }
}
