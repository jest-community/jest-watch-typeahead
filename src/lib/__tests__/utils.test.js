import stripAnsi from 'strip-ansi';
import { trimAndFormatPath, formatTestNameByPattern } from '../utils';

jest.mock('chalk', () => {
  const chalk = jest.requireActual('chalk');
  return new chalk.constructor({ enabled: true, level: 1 });
});

test('trimAndFormatPath', () => {
  expect(
    stripAnsi(
      trimAndFormatPath(2, { cwd: '/hello/there' }, '/hello/there/to/you', 80),
    ),
  ).toEqual('to/you');
});

describe('formatTestNameByPattern', () => {
  test.each`
    testName           | pattern   | width
    ${'the test name'} | ${'the'}  | ${30}
    ${'the test name'} | ${'the'}  | ${25}
    ${'the test name'} | ${'the'}  | ${20}
    ${'the test name'} | ${'the'}  | ${15}
    ${'the test name'} | ${'the'}  | ${10}
    ${'the test name'} | ${'the'}  | ${5}
    ${'the test name'} | ${'test'} | ${30}
    ${'the test name'} | ${'test'} | ${25}
    ${'the test name'} | ${'test'} | ${20}
    ${'the test name'} | ${'test'} | ${15}
    ${'the test name'} | ${'test'} | ${10}
    ${'the test name'} | ${'test'} | ${5}
    ${'the test name'} | ${'name'} | ${30}
    ${'the test name'} | ${'name'} | ${25}
    ${'the test name'} | ${'name'} | ${20}
    ${'the test name'} | ${'name'} | ${15}
    ${'the test name'} | ${'name'} | ${10}
    ${'the test name'} | ${'name'} | ${5}
  `(
    'formats when testname="$testName", pattern="$pattern", and width="$width"',
    ({ testName, pattern, width }) => {
      expect(
        formatTestNameByPattern(testName, pattern, width),
      ).toMatchSnapshot();
    },
  );
});
