import {
  trimAndFormatPath,
  formatTestNameByPattern,
  highlight,
} from '../utils';

jest.mock('chalk', () => {
  const chalk = jest.requireActual('chalk');
  return new chalk.constructor({ enabled: true, level: 1 });
});

describe('trimAndFormatPath', () => {
  test.each`
    testPath                                           | pad  | columns
    ${'/project/src/gonna/fit/all.js'}                 | ${6} | ${80}
    ${'/project/src/trimmed_dir/foo.js'}               | ${6} | ${20}
    ${'/project/src/exactly/sep_and_basename.js'}      | ${6} | ${29}
    ${'/project/src/long_name_gonna_need_trimming.js'} | ${6} | ${40}
  `(
    'formats when testpath="$testPath", pad="$pad", and columns="$columns"',
    ({ testPath, pad, columns }) => {
      expect(
        trimAndFormatPath(pad, { rootDir: '/project' }, testPath, columns),
      ).toMatchSnapshot();
    },
  );
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

describe('highlight', () => {
  const rawPath =
    '/Users/janedoe/monorepo/libs/utils/src/__tests__/hello-world.js';
  const pattern = 'hello';

  test.each`
    filePath                                     | rootDir
    ${'libs/utils/src/__tests__/hello-world.js'} | ${'/Users/janedoe/monorepo'}
    ${'...s/utils/src/__tests__/hello-world.js'} | ${'/Users/janedoe/monorepo'}
    ${'...s/utils/src/__tests__/hello-world.js'} | ${'/Users/janedoe/monorepo/libs/utils'}
    ${'libs/utils/src/__tests__/hello-world.js'} | ${'/Users/janedoe/monorepo/libs/utils'}
  `(
    `highlights match correctly when filePath="$filePath" and rootDir="$rootDir"`,
    ({ filePath, rootDir }) => {
      expect(highlight(rawPath, filePath, pattern, rootDir)).toMatchSnapshot();
    },
  );
});
