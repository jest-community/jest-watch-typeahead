import { KEYS } from 'jest-watcher';
import type { Config } from '@jest/types';
import { jest } from '@jest/globals';

let pluginTester: typeof import('../../test_utils/pluginTester').default = null;
let FileNamePlugin: typeof import('../plugin').default = null;

jest.unstable_mockModule('ansi-escapes', () => ({
  default: {
    clearScreen: '[MOCK - clearScreen]',
    cursorDown: (count = 1) => `[MOCK - cursorDown(${count})]`,
    cursorLeft: '[MOCK - cursorLeft]',
    cursorHide: '[MOCK - cursorHide]',
    cursorRestorePosition: '[MOCK - cursorRestorePosition]',
    cursorSavePosition: '[MOCK - cursorSavePosition]',
    cursorShow: '[MOCK - cursorShow]',
    cursorTo: (x, y) => `[MOCK - cursorTo(${x}, ${y})]`,
  },
}));

jest.doMock('ansi-escapes', () => ({
  clearScreen: '[MOCK - clearScreen]',
  cursorDown: (count = 1) => `[MOCK - cursorDown(${count})]`,
  cursorLeft: '[MOCK - cursorLeft]',
  cursorHide: '[MOCK - cursorHide]',
  cursorRestorePosition: '[MOCK - cursorRestorePosition]',
  cursorSavePosition: '[MOCK - cursorSavePosition]',
  cursorShow: '[MOCK - cursorShow]',
  cursorTo: (x, y) => `[MOCK - cursorTo(${x}, ${y})]`,
}));

const projects: Config.ProjectConfig[] = [
  {
    config: {
      rootDir: '/project',
    },
    testPaths: ['/project/src/foo.js', '/project/src/file-1.js'],
  },
  {
    config: {
      rootDir: '/project',
    },
    testPaths: ['/project/src/bar.js', '/project/src/file-2.js'],
  },
];

beforeAll(async () => {
  FileNamePlugin = (await import('../plugin')).default;
  pluginTester = (await import('../../test_utils/pluginTester')).default;
});

it('shows the correct initial state', async () => {
  const { stdout, hookEmitter, updateConfigAndRun, plugin, type } =
    pluginTester(FileNamePlugin);

  hookEmitter.onFileChange({ projects });
  const runPromise = plugin.run({}, updateConfigAndRun);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
  type(KEYS.ENTER);

  await runPromise;
});

it('can use arrows to select a specific file', async () => {
  const { stdout, hookEmitter, updateConfigAndRun, plugin, type } =
    pluginTester(FileNamePlugin);

  hookEmitter.onFileChange({ projects });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('f', 'i', KEYS.ARROW_DOWN, KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testPathPattern: 'src/file-1\\.js',
  });
});

it('can select a specific file that includes a regexp special character', async () => {
  const { hookEmitter, updateConfigAndRun, plugin, type } =
    pluginTester(FileNamePlugin);

  hookEmitter.onFileChange({
    projects: [
      {
        config: {
          rootDir: '/project',
        },
        testPaths: ['/project/src/file_(xyz).js'],
      },
    ],
  });
  const runPromise = plugin.run({}, updateConfigAndRun);

  type('x', 'y', 'z', KEYS.ARROW_DOWN, KEYS.ENTER);

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testPathPattern: 'src/file_\\(xyz\\)\\.js',
  });
});

it('can select a pattern that matches multiple files', async () => {
  const { stdout, hookEmitter, updateConfigAndRun, plugin, type } =
    pluginTester(FileNamePlugin);

  hookEmitter.onFileChange({ projects });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('f', 'i', KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testPathPattern: 'f.*i',
  });
});

it('can configure the key and prompt', async () => {
  const { plugin } = pluginTester(FileNamePlugin, {
    config: {
      key: 'l',
      prompt: 'have a custom prompt',
    },
  });

  expect(plugin.getUsageInfo()).toEqual({
    key: 'l',
    prompt: 'have a custom prompt',
  });
});

it('file matching is case insensitive', async () => {
  const { stdout, hookEmitter, updateConfigAndRun, plugin, type } =
    pluginTester(FileNamePlugin);

  hookEmitter.onFileChange({ projects });
  const runPromise = plugin.run({}, updateConfigAndRun);
  type('f');
  stdout.write.mockReset();
  type('I');
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
  type(KEYS.ENTER);
  await runPromise;
});

it("selected file doesn't include trimming dots", async () => {
  const { hookEmitter, updateConfigAndRun, plugin, type } = pluginTester(
    FileNamePlugin,
    {
      stdout: { columns: 40 },
    },
  );

  hookEmitter.onFileChange({
    projects: [
      {
        config: {
          rootDir: '/project',
        },
        testPaths: ['/project/src/long_name_gonna_need_trimming.js'],
      },
    ],
  });
  const runPromise = plugin.run({}, updateConfigAndRun);

  type('t', 'r', 'i', 'm', 'm', KEYS.ARROW_DOWN, KEYS.ENTER);
  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testPathPattern: 'ong_name_gonna_need_trimming\\.js',
  });
});

it('can fuzzy search', async () => {
  const { stdout, hookEmitter, updateConfigAndRun, plugin, type } =
    pluginTester(FileNamePlugin);

  hookEmitter.onFileChange({ projects });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('f', '1', KEYS.ARROW_DOWN, KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testPathPattern: 'src/file-1\\.js',
  });
});
