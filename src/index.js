// @flow

import Prompt from './shared/Prompt';
import TestPathPatternPrompt, {
  type SearchSources,
} from './test_path_pattern_prompt';

class TestPathPlugin {
  _stdin: stream$Readable | tty$ReadStream;
  _stdout: stream$Writable | tty$WriteStream;
  _prompt: Prompt;
  _projects: SearchSources;

  constructor({
    stdin,
    stdout,
  }: {
    stdin: stream$Readable | tty$ReadStream,
    stdout: stream$Writable | tty$WriteStream,
  }) {
    this._stdin = stdin;
    this._stdout = stdout;
    this._prompt = new Prompt();
    this._projects = [];
  }

  apply(jestHooks: Object) {
    jestHooks.fileChange(({ projects }) => {
      this._projects = projects;
    });
  }

  onKey(key: string) {
    this._prompt.put(key);
  }

  run(globalConfig: Object, updateConfigAndRun: Function): Promise<void> {
    const p = new TestPathPatternPrompt(this._stdout, this._prompt);
    p.updateSearchSources(this._projects);
    return new Promise((res, rej) => {
      p.run(value => {
        updateConfigAndRun({ mode: 'watch', testPathPattern: value });
        res();
      }, rej);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getUsageInfo() {
    return {
      key: 'p'.codePointAt(0),
      prompt: 'filter by a filename regex pattern',
    };
  }
}

module.exports = TestPathPlugin;
