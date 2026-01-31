import * as path from 'path';
import * as fs from 'fs-extra';
import { TemplateType, TemplateOptions } from '../types/index.js';
import { FileUtils } from '../utils/file-utils.js';

interface GenerateResult {
  success: boolean;
  message: string;
  path?: string;
}

export class TemplateEngine {
  private templatesDir: string;

  constructor() {
    // Get templates directory from package root
    this.templatesDir = path.join(process.cwd(), 'templates');
  }

  async generate(options: TemplateOptions & { type: TemplateType; output?: string }): Promise<GenerateResult> {
    const templateFile = path.join(this.templatesDir, `${options.type}-template.md`);

    // Check if template exists
    if (!(await fs.pathExists(templateFile))) {
      // Create default template inline
      return await this.generateFromDefaults(options);
    }

    try {
      const template = await fs.readFile(templateFile, 'utf-8');
      const filled = this.fillTemplate(template, options);

      // Determine output path
      const outputPath = this.getOutputPath(options);

      // Ensure directory exists
      await FileUtils.ensureDir(path.dirname(outputPath));

      // Write template
      await fs.writeFile(outputPath, filled, 'utf-8');

      return {
        success: true,
        message: `Template "${options.name}" created successfully`,
        path: outputPath
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate template'
      };
    }
  }

  private async generateFromDefaults(options: TemplateOptions & { type: TemplateType; output?: string }): Promise<GenerateResult> {
    const template = this.getDefaultTemplate(options.type);
    const filled = this.fillTemplate(template, options);

    const outputPath = this.getOutputPath(options);
    await FileUtils.ensureDir(path.dirname(outputPath));

    await fs.writeFile(outputPath, filled, 'utf-8');

    return {
      success: true,
      message: `Template "${options.name}" created from defaults`,
      path: outputPath
    };
  }

  private fillTemplate(template: string, options: TemplateOptions & { type?: TemplateType }): string {
    const date = new Date().toISOString();
    const year = new Date().getFullYear();

    return template
      .replace(/\{\{NAME\}\}/g, options.name)
      .replace(/\{\{DESCRIPTION\}\}/g, options.description || `A ${options.name}`)
      .replace(/\{\{AUTHOR\}\}/g, options.author || '')
      .replace(/\{\{DATE\}\}/g, date)
      .replace(/\{\{YEAR\}\}/g, year.toString())
      .replace(/\{\{TAGS\}\}/g, options.tags?.join(', ') || '');
  }

  private getOutputPath(options: TemplateOptions & { type: TemplateType; output?: string }): string {
    if (options.output) {
      return options.output;
    }

    // Default output paths based on type
    const baseDir = FileUtils.getBaseAgentsRoot();

    switch (options.type) {
      case 'skill':
        return path.join(baseDir, 'skills', options.name, 'SKILL.md');
      case 'agent':
        return path.join(baseDir, 'agents', options.name, 'AGENT.md');
      case 'mcp':
        return path.join(baseDir, 'mcp', options.name, 'mcp.json');
      case 'command':
        return path.join(baseDir, 'commands', options.name, 'COMMAND.md');
    }
  }

  private getDefaultTemplate(type: TemplateType): string {
    const templates: Record<TemplateType, string> = {
      skill: this.getSkillTemplate(),
      agent: this.getAgentTemplate(),
      mcp: this.getMcpTemplate(),
      command: this.getCommandTemplate()
    };

    return templates[type] || '';
  }

  private getSkillTemplate(): string {
    return `---
name: {{NAME}}
description: {{DESCRIPTION}}
author: {{AUTHOR}}
tags: {{TAGS}}
---

# {{NAME}}

{{DESCRIPTION}}

## When to Use

Use this skill when:
- Working with {{NAME}}
- Need to {{NAME}}

## Instructions

1. First step
2. Second step
3. Third step

## Examples

### Example 1

Description of example 1.

\`\`\`
Example code or usage
\`\`\`

## Notes

Additional notes and considerations.
`;
  }

  private getAgentTemplate(): string {
    return `---
name: {{NAME}}
description: {{DESCRIPTION}}
author: {{AUTHOR}}
tags: {{TAGS}}
---

# {{NAME}} Agent

{{DESCRIPTION}}

## Capabilities

- Capability 1
- Capability 2
- Capability 3

## Usage

\`\`\`bash
base-agents run {{NAME}}
\`\`\`

## Configuration

Add to your \`AGENT.md\`:

\`\`\`markdown
## {{NAME}}

Description of when this agent should be used.
\`\`\`
`;
  }

  private getMcpTemplate(): string {
    return JSON.stringify(
      {
        name: '{{NAME}}',
        description: '{{DESCRIPTION}}',
        version: '1.0.0',
        author: '{{AUTHOR}}',
        tags: ['{{TAGS}}'],
        created: '{{DATE}}',
        server: {
          command: 'node',
          args: ['path/to/server.js'],
          env: {}
        },
        capabilities: {
          resources: {},
          tools: [],
          prompts: []
        }
      },
      null,
      2
    );
  }

  private getCommandTemplate(): string {
    return `---
name: {{NAME}}
description: {{DESCRIPTION}}
author: {{AUTHOR}}
tags: {{TAGS}}
---

# {{NAME}} Command

{{DESCRIPTION}}

## Usage

\`\`\`bash
base-agents {{NAME}} [options]
\`\`\`

## Options

- \`-h, --help\` - Show help
- \`-v, --version\` - Show version

## Examples

\`\`\`bash
# Example 1
base-agents {{NAME}}

# Example 2
base-agents {{NAME}} --option value
\`\`\`

## Output

Description of what this command outputs.
`;
  }
}
