import {
  JestHook,
  WatchPlugin,
  JestHookEmitter,
  UpdateConfigCallback,
} from 'jest-watcher';
import stripAnsi from 'strip-ansi';
import type FileNamePlugin from '../file_name_plugin/plugin';
import type TestNamePlugin from '../test_name_plugin/plugin';
import type { PluginConfig } from '../types/Config';

expect.addSnapshotSerializer({
  test: (val) => typeof val === 'string',
  print: (val) => stripAnsi(val as string),
});

/**
 * See https://github.com/facebook/jest/pull/7523 for more details
 */
const CLEAR = '\x1B[2J\x1B[3J\x1B[H';
expect.addSnapshotSerializer({
  test: (val) => val.includes(CLEAR),
  print: (val) => stripAnsi((val as string).replace(CLEAR, '[MOCK - clear]')),
});

/**
 * See https://github.com/facebook/jest/pull/7523 for more details
 */
const WINDOWS_CLEAR = '\x1B[2J\x1B[0f';
expect.addSnapshotSerializer({
  test: (val) => val.includes(WINDOWS_CLEAR),
  print: (val) =>
    stripAnsi((val as string).replace(WINDOWS_CLEAR, '[MOCK - clear]')),
});

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
