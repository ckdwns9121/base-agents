import { FileUtils } from '../utils/file-utils.js';
import { logger } from '../utils/logger.js';

export async function configCommand(
  action: string,
  key?: string,
  value?: string
): Promise<void> {
  const configDir = FileUtils.getConfigDir();
  const configPath = `${configDir}/config.json`;

  let config = await FileUtils.readJson<any>(configPath) || {
    preferences: {
      defaultBranch: 'main',
      autoUpdate: true,
      updateInterval: '7d'
    },
    paths: {
      root: FileUtils.getBaseAgentsRoot(),
      cache: `${configDir}/cache`,
      temp: '/tmp/base-agents'
    },
    git: {
      depth: 1,
      singleBranch: true
    },
    sync: {
      enabled: true,
      conflictStrategy: 'ask'
    }
  };

  switch (action) {
    case 'get':
      if (key) {
        const keys = key.split('.');
        let result = config;
        for (const k of keys) {
          result = result?.[k];
        }
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(JSON.stringify(config, null, 2));
      }
      break;

    case 'set':
      if (!key || !value) {
        logger.error('Both key and value are required for "set" action');
        logger.info('Usage: base-agents config set <key> <value>');
        logger.info('Example: base-agents config set preferences.defaultBranch main');
        process.exit(1);
      }

      const keys = key.split('.');
      let target = config;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in target)) {
          target[keys[i]] = {};
        }
        target = target[keys[i]];
      }

      // Try to parse value as JSON, fallback to string
      try {
        target[keys[keys.length - 1]] = JSON.parse(value);
      } catch {
        target[keys[keys.length - 1]] = value;
      }

      await FileUtils.writeJson(configPath, config);
      logger.success(`Set ${key} = ${value}`);
      break;

    case 'list':
    case 'show':
      console.log(JSON.stringify(config, null, 2));
      break;

    case 'reset':
      // Delete config file to reset to defaults
      const fs = await import('fs-extra');
      await fs.remove(configPath);
      logger.success('Configuration reset to defaults');
      break;

    default:
      logger.error(`Unknown action: ${action}`);
      logger.info('Available actions: get, set, list, reset');
      process.exit(1);
  }
}
