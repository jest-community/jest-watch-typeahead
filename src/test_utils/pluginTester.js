import { JestHook } from 'jest-watcher';
import stripAnsi from 'strip-ansi';

expect.addSnapshotSerializer({
  test: (val) => typeof val === 'string',
  print: (val) => stripAnsi(val),
});

/**
 * See https://github.com/facebook/jest/pull/7523 for more details
 */
const CLEAR = '\x1B[2J\x1B[3J\x1B[H';
expect.addSnapshotSerializer({
  test: (val) => val.includes(CLEAR),
  print: (val) => stripAnsi(val.replace(CLEAR, '[MOCK - clear]')),
});

/**
 * See https://github.com/facebook/jest/pull/7523 for more details
 */
const WINDOWS_CLEAR = '\x1B[2J\x1B[0f';
expect.addSnapshotSerializer({
  test: (val) => val.includes(WINDOWS_CLEAR),
  print: (val) => stripAnsi(val.replace(WINDOWS_CLEAR, '[MOCK - clear]')),
});

const pluginTester = (Plugin, options = {}) => {
  const stdout = {
    columns: (options.stdout || {}).columns || 80,
    write: jest.fn(),
  };
  const jestHooks = new JestHook();
  const plugin = new Plugin({ stdout, config: options.config });
  plugin.apply(jestHooks.getSubscriber());

  const type = (...keys) => keys.forEach((key) => plugin.onKey(key));

  return {
    stdout,
    hookEmitter: jestHooks.getEmitter(),
    updateConfigAndRun: jest.fn(),
    plugin,
    type,
  };
};

export default pluginTester;
