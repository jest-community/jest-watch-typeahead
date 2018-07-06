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
  _usageInfo: { key: string, prompt: string };

  constructor({
    stdin,
    stdout,
    config = {},
  }: {
    stdin: stream$Readable | tty$ReadStream,
    stdout: stream$Writable | tty$WriteStream,
    config: PluginConfig,
  }) {
    this._stdin = stdin;
    this._stdout = stdout;
    this._prompt = new Prompt();
    this._testResults = [];
    this._usageInfo = {
      key: config.key || 't',
      prompt: config.prompt || 'filter by a test name regex pattern',
    };
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

  getUsageInfo() {
    return this._usageInfo;
  }
}

module.exports = TestNamePlugin;
