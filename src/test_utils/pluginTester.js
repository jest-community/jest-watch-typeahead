import { JestHook } from 'jest-watcher';
import stripAnsi from 'strip-ansi';

expect.addSnapshotSerializer({
  test: val => typeof val === 'string',
  print: val => stripAnsi(val),
});

jest.mock('ansi-escapes', () => ({
  clearScreen: '[MOCK - clearScreen]',
  cursorDown: (count = 1) => `[MOCK - cursorDown(${count})]`,
  cursorLeft: '[MOCK - cursorLeft]',
  cursorHide: '[MOCK - cursorHide]',
  cursorRestorePosition: '[MOCK - cursorRestorePosition]',
  cursorSavePosition: '[MOCK - cursorSavePosition]',
  cursorShow: '[MOCK - cursorShow]',
  cursorTo: (x, y) => `[MOCK - cursorTo(${x}, ${y})]`,
}));

const pluginTester = (Plugin, config = {}) => {
  const stdout = { columns: 80, write: jest.fn() };
  const jestHooks = new JestHook();
  const plugin = new Plugin({ stdout, config });
  plugin.apply(jestHooks.getSubscriber());

  const type = (...keys) => keys.forEach(key => plugin.onKey(key));

  return {
    stdout,
    hookEmitter: jestHooks.getEmitter(),
    updateConfigAndRun: jest.fn(),
    plugin,
    type,
  };
};

export default pluginTester;
