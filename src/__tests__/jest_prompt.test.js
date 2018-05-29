import chalk from 'chalk';

jest.doMock('chalk', () => new chalk.constructor({ enabled: false }));
jest.mock('ansi-escapes', () => ({
  clearScreen: '[MOCK - clearScreen]',
  cursorDown: (count = 1) => `[MOCK - cursorDown(${count})]`,
  cursorHide: '[MOCK - cursorHide]',
  cursorRestorePosition: '[MOCK - cursorRestorePosition]',
  cursorSavePosition: '[MOCK - cursorSavePosition]',
  cursorShow: '[MOCK - cursorShow]',
  cursorTo: (x, y) => `[MOCK - cursorTo(${x}, ${y})]`,
}));

beforeEach(() => {
  // eslint-disable-next-line global-require
  const utils = require('../lib/utils');
  jest.spyOn(utils, 'getTerminalWidth').mockImplementation(() => 80);
});

const TestPathPatternPrompt = require('../test_path_pattern_prompt').default;
const Prompt = require('../shared/Prompt').default;

const jestPrompt = ({ stdin, stdout, searchSources }) => {
  const prompt = new Prompt();
  const p = new TestPathPatternPrompt(stdout, prompt);
  p.updateSearchSources(searchSources);

  const onkeypress = key => {
    prompt.put(key);
  };

  stdin.on('data', onkeypress);
  p.run(
    () => {
      stdin.removeListener('data', onkeypress);
    },
    () => {
      stdin.removeListener('data', onkeypress);
    },
  );
};

class MockStdin {
  constructor() {
    this._callbacks = [];
  }

  on(evt, callback) {
    this._callbacks.push(callback);
  }

  emit(key) {
    this._callbacks.forEach(cb => cb(key));
  }
}

let stdin;
let stdout;
let searchSource;
const nextTick = () => new Promise(res => process.nextTick(res));

beforeEach(() => {
  stdin = new MockStdin();
  stdout = { write: jest.fn() };
  searchSource = {
    config: { rootDir: '/rootDir/' },
    testPaths: [
      '/rootDir/path/to/file-1.js',
      '/rootDir/path/to/file-2.js',
      '/rootDir/path/to/file-3.js',
    ],
  };
});

const type = async str => {
  str.split('').forEach(c => {
    stdin.emit(c);
  });

  await nextTick();
};

it('Renders when no files match', () => {
  jestPrompt({ stdin, stdout, searchSources: [searchSource] });
  type('no-match');
  stdout.write.mockReset();
  type('x');
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
});

it('Renders when there is one match', () => {
  jestPrompt({ stdin, stdout, searchSources: [searchSource] });
  type('p.*');
  stdout.write.mockReset();
  type('1');
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
});

it('Renders when there are many matches', () => {
  jestPrompt({ stdin, stdout, searchSources: [searchSource] });
  type('p.');
  stdout.write.mockReset();
  type('*');
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
});
