# Base Agents

CLI tool for managing AI IDE tool configurations (.claude, .gemini, .cursor, .opencode, .agents) from Git repositories.

## Features

- **Install/Update**: Clone and keep AI tool configurations up to date from Git repositories
- **Sync**: Share configurations across multiple AI tools
- **Templates**: Generate new skills, agents, and MCP server templates
- **Multi-tool Support**: Claude Code, Cursor IDE, Gemini Code Assist, and more

## Installation

```bash
npm install -g base-agents
```

Or use directly with npx:

```bash
npx base-agents <command>
```

## Quick Start

```bash
# Initialize base-agents
base-agents init

# Install Claude Code configurations
base-agents install claude

# Install Cursor rules from a custom repository
base-agents install cursor https://github.com/user/cursor-rules

# List all installed tools
base-agents list

# Generate a new skill template
base-agents template skill my-testing-patterns

# Sync configurations between tools
base-agents sync claude gemini
```

## Commands

### `base-agents init`

Initialize base-agents configuration in `~/.base-agents`.

```bash
base-agents init
```

### `base-agents install <tool> [repo]`

Install or update tool configurations from a Git repository.

```bash
# Install with default repository
base-agents install claude

# Install from custom repository
base-agents install claude https://github.com/user/claude-configs

# Install from specific branch
base-agents install cursor --branch main

# Force reinstall
base-agents install claude --force
```

**Options:**
- `-r, --repo <url>` - Custom repository URL
- `-b, --branch <name>` - Branch name (default: main)
- `-f, --force` - Force reinstall

### `base-agents sync <source> [targets...]`

Sync configurations between tools.

```bash
# Sync Claude configs to Gemini
base-agents sync claude gemini

# Sync to multiple targets
base-agents sync claude gemini cursor

# Overwrite on conflict
base-agents sync claude gemini --conflict overwrite
```

**Options:**
- `-c, --conflict <strategy>` - Conflict strategy: ask, overwrite, skip (default: ask)

### `base-agents template <type> <name>`

Generate a new template.

```bash
# Generate skill template
base-agents template skill testing-patterns

# Generate agent template with description
base-agents template agent code-reviewer --description "Reviews code for best practices"

# Generate MCP server template
base-agents template mcp my-jira-server

# Generate in custom directory
base-agents template skill my-skill --output ./custom/path
```

**Options:**
- `-d, --description <text>` - Template description
- `-o, --output <path>` - Output directory

### `base-agents list [tool]`

List installed configurations.

```bash
# List all tools
base-agents list

# List specific tool details
base-agents list claude
```

### `base-agents config <action> [key] [value]`

Manage configuration.

```bash
# Get all config
base-agents config get

# Get specific key
base-agents config get preferences.defaultBranch

# Set config value
base-agents config set preferences.defaultBranch main

# List all config
base-agents config list

# Reset to defaults
base-agents config reset
```

## Supported Tools

| Tool | Description | Status |
|------|-------------|--------|
| **claude** | Claude Code configurations | ✅ Supported |
| **cursor** | Cursor IDE rules | ✅ Supported |
| **gemini** | Gemini Code Assist | ✅ Supported |
| **opencode** | OpenCode configurations | 🚧 Coming soon |
| **agents** | Generic agents | ✅ Supported |

## Aliases

Each tool has aliases for convenience:

- `claude`: `.claude`, `claude-code`, `anthropic`
- `cursor`: `.cursor`, `cursor-ide`
- `gemini`: `.gemini`, `gemini-code`, `google`
- `opencode`: `.opencode`, `open-code`
- `agents`: `.agents`, `agent`

## Directory Structure

```
~/.base-agents/           # Root directory
├── claude/               # Claude configurations
├── cursor/               # Cursor configurations
├── gemini/               # Gemini configurations
├── agents/               # Generic agents
└── .config/              # Internal config
    ├── registry.json     # Tool registry
    ├── state.json        # Installation state
    └── config.json       # User configuration
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev -- <command>

# Watch mode
npm run watch

# Run tests
npm test

# Lint code
npm run lint
```

## Configuration

Base-agents stores configuration in `~/.base-agents/.config/config.json`:

```json
{
  "preferences": {
    "defaultBranch": "main",
    "autoUpdate": true,
    "updateInterval": "7d"
  },
  "paths": {
    "root": "~/.base-agents",
    "cache": "~/.base-agents/.config/cache",
    "temp": "/tmp/base-agents"
  },
  "git": {
    "depth": 1,
    "singleBranch": true
  },
  "sync": {
    "enabled": true,
    "conflictStrategy": "ask"
  }
}
```

## Environment Variables

- `BASE_AGENTS_ROOT` - Override default root directory
- `BASE_AGENTS_LOG_LEVEL` - Set logging verbosity
- `DEBUG` - Enable debug output

## License

MIT
