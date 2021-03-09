import { KEYS } from 'jest-watcher';
import pluginTester from '../../test_utils/pluginTester';
import TestNamePlugin from '../plugin';

const testResults = [
  {
    testResults: [
      { title: 'foo 1', fullName: 'some description foo 1' },
      { title: 'bar 1', fullName: 'some description bar 1' },
    ],
  },
  {
    testResults: [
      { title: 'foo 2', fullName: 'other description foo 2' },
      { title: 'bar 2', fullName: 'other description bar 2' },
    ],
  },
];

it('shows the correct initial state', async () => {
  const { stdout, updateConfigAndRun, plugin, type } = pluginTester(
    TestNamePlugin,
  );

  const runPromise = plugin.run({}, updateConfigAndRun);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
  type(KEYS.ENTER);

  await runPromise;
});

it('shows the correct message when there are no cached tests', async () => {
  const { stdout, updateConfigAndRun, plugin, type } = pluginTester(
    TestNamePlugin,
  );

  const runPromise = plugin.run({}, updateConfigAndRun);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
  type('t', KEYS.ENTER);

  await runPromise;
});

it('can use arrows to select a specific test', async () => {
  const {
    stdout,
    hookEmitter,
    updateConfigAndRun,
    plugin,
    type,
  } = pluginTester(TestNamePlugin);

  hookEmitter.onTestRunComplete({ testResults });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('f', KEYS.ARROW_DOWN, KEYS.ARROW_DOWN, KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testNamePattern: '^other description foo 2$',
  });
});

it('can select a pattern that matches multiple tests', async () => {
  const {
    stdout,
    hookEmitter,
    updateConfigAndRun,
    plugin,
    type,
  } = pluginTester(TestNamePlugin);

  hookEmitter.onTestRunComplete({ testResults });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('f', 'o', KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testNamePattern: 'fo',
  });
});

it('can select a pattern that matches a describe block', async () => {
  const {
    stdout,
    hookEmitter,
    updateConfigAndRun,
    plugin,
    type,
  } = pluginTester(TestNamePlugin);

  hookEmitter.onTestRunComplete({ testResults });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('s', 'o', KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testNamePattern: 'so',
  });
});

it('can select a pattern that includes a regexp special character', async () => {
  const { hookEmitter, updateConfigAndRun, plugin, type } = pluginTester(
    TestNamePlugin,
  );

  hookEmitter.onTestRunComplete({
    testResults: [
      {
        testResults: [
          { title: 'bracket', fullName: 'bracket description (foo)' },
        ],
      },
    ],
  });
  const runPromise = plugin.run({}, updateConfigAndRun);

  type('b', 'r', KEYS.ARROW_DOWN, KEYS.ENTER);

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testNamePattern: '^bracket description \\(foo\\)$',
  });
});

it('can configure the key and prompt', async () => {
  const { plugin } = pluginTester(TestNamePlugin, {
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

it('test matching is case insensitive', async () => {
  const {
    stdout,
    hookEmitter,
    updateConfigAndRun,
    plugin,
    type,
  } = pluginTester(TestNamePlugin);

  hookEmitter.onTestRunComplete({ testResults });
  const runPromise = plugin.run({}, updateConfigAndRun);
  type('f');
  stdout.write.mockReset();
  type('O');
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
  type(KEYS.ENTER);
  await runPromise;
});

it("selected pattern doesn't include trimming dots", async () => {
  const { hookEmitter, updateConfigAndRun, plugin, type } = pluginTester(
    TestNamePlugin,
    {
      stdout: { columns: 30 },
    },
  );

  hookEmitter.onTestRunComplete({
    testResults: [
      {
        testResults: [
          {
            title: 'trimmed long',
            fullName: 'long test name, gonna need trimming',
          },
        ],
      },
    ],
  });
  const runPromise = plugin.run({}, updateConfigAndRun);

  type('t', 'r', 'i', 'm', 'm', KEYS.ARROW_DOWN, KEYS.ENTER);
  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testNamePattern: '^me, gonna need trimming$',
  });
});
