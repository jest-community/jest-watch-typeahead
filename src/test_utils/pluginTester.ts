import {
  JestHook,
  type WatchPlugin,
  type JestHookEmitter,
  type UpdateConfigCallback,
} from 'jest-watcher';
import { jest } from '@jest/globals';
import type FileNamePlugin from '../file_name_plugin/plugin';
import type TestNamePlugin from '../test_name_plugin/plugin';
import type { PluginConfig } from '../types/Config';

type Options = {
  stdout?: { columns?: number };
  config?: PluginConfig;
};

export default function pluginTester(
  Plugin: typeof TestNamePlugin | typeof FileNamePlugin,
  options: Options = {},
): {
  stdout: {
    columns: number;
    write: (input: string) => void;
  };
  hookEmitter: JestHookEmitter;
  updateConfigAndRun: UpdateConfigCallback;
  plugin: WatchPlugin;
  type: (...keys: string[]) => void;
} {
  const stdout = {
    columns: (options.stdout || {}).columns || 80,
    write: jest.fn(),
  } as unknown as NodeJS.WriteStream;
  const jestHooks = new JestHook();
  const plugin = new Plugin({
    stdout,
    stdin: process.stdin,
    config: options.config,
  });
  plugin.apply!(jestHooks.getSubscriber());

  const type = (...keys: string[]) => keys.forEach((key) => plugin.onKey!(key));

  return {
    stdout,
    hookEmitter: jestHooks.getEmitter(),
    updateConfigAndRun: jest.fn(),
    plugin,
    type,
  };
}
