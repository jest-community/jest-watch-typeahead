import {
  Prompt,
  WatchPlugin,
  JestHookSubscriber,
  UpdateConfigCallback,
  UsageData,
} from 'jest-watcher';
import type { Config } from '@jest/types';
import type { TestResult } from '@jest/test-result';
import TestNamePatternPrompt from './prompt';
import type { PluginConfig } from '../types/Config';

export default class TestNamePlugin implements WatchPlugin {
  _stdin: NodeJS.ReadStream;

  _stdout: NodeJS.WriteStream;

  _prompt: Prompt;

  _testResults: Array<TestResult>;

  _usageInfo: UsageData;

  constructor({
    stdin,
    stdout,
    config = {},
  }: {
    stdin: NodeJS.ReadStream;
    stdout: NodeJS.WriteStream;
    config?: PluginConfig;
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

  apply(jestHooks: JestHookSubscriber): void {
    jestHooks.onTestRunComplete(({ testResults }) => {
      this._testResults = testResults;
    });
  }

  onKey(key: string): void {
    this._prompt.put(key);
  }

  run(
    globalConfig: Config.GlobalConfig,
    updateConfigAndRun: UpdateConfigCallback,
  ): Promise<void> {
    const p = new TestNamePatternPrompt(this._stdout, this._prompt);
    p.updateCachedTestResults(this._testResults);
    return new Promise((res, rej) => {
      p.run((testNamePattern) => {
        updateConfigAndRun({
          mode: 'watch',
          testNamePattern,
        });
        res();
      }, rej);
    });
  }

  getUsageInfo(): UsageData {
    return this._usageInfo;
  }
}
