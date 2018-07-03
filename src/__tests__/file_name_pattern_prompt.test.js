import { KEYS } from 'jest-watcher';
import pluginTester from './pluginTester';
import FileNamePlugin from '../file_name_plugin';

const projects = [
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

it('shows the correct initial state', async () => {
  const {
    stdout,
    hookEmitter,
    updateConfigAndRun,
    plugin,
    type,
  } = pluginTester(FileNamePlugin);

  hookEmitter.onFileChange({ projects });
  const runPromise = plugin.run({}, updateConfigAndRun);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
  type(KEYS.ENTER);

  await runPromise;
});

it('can use arrows to select a specific file', async () => {
  const {
    stdout,
    hookEmitter,
    updateConfigAndRun,
    plugin,
    type,
  } = pluginTester(FileNamePlugin);

  hookEmitter.onFileChange({ projects });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('f', 'i', KEYS.ARROW_DOWN, KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testPathPattern: 'src/file-1.js',
  });
});

it('can select a pattern that matches multiple files', async () => {
  const {
    stdout,
    hookEmitter,
    updateConfigAndRun,
    plugin,
    type,
  } = pluginTester(FileNamePlugin);

  hookEmitter.onFileChange({ projects });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('f', 'i', KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testPathPattern: 'fi',
  });
});
