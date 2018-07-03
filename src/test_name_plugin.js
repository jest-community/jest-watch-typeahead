// @flow

import { Prompt } from 'jest-watcher';
import TestNamePatternPrompt, {
  type TestResult,
} from './test_name_pattern_prompt';

type PluginConfig = {
  key?: string,
  prompt?: string,
};

class TestNamePlugin {
  _stdin: stream$Readable | tty$ReadStream;
  _stdout: stream$Writable | tty$WriteStream;
  _prompt: Prompt;
  _testResults: Array<TestResult>;
  _config: PluginConfig;

  constructor({
    stdin,
    stdout,
    config,
  }: {
    stdin: stream$Readable | tty$ReadStream,
    stdout: stream$Writable | tty$WriteStream,
    config: PluginConfig,
  }) {
    this._stdin = stdin;
    this._stdout = stdout;
    this._prompt = new Prompt();
    this._testResults = [];
    this._config = config;
  }

  apply(jestHooks: Object) {
    jestHooks.onTestRunComplete(({ testResults }) => {
      this._testResults = testResults;
    });
  }

  onKey(key: string) {
    this._prompt.put(key);
  }

  run(globalConfig: Object, updateConfigAndRun: Function): Promise<void> {
    const p = new TestNamePatternPrompt(this._stdout, this._prompt);
    p.updateCachedTestResults(this._testResults);
    return new Promise((res, rej) => {
      p.run(value => {
        updateConfigAndRun({ mode: 'watch', testNamePattern: value });
        res();
      }, rej);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getUsageInfo() {
    return {
      key: this._config.key || 't',
      prompt: this._config.prompt || 'filter by a test name regex pattern',
    };
  }
}

module.exports = TestNamePlugin;
