import {
  type WatchPlugin,
  Prompt,
  type JestHookSubscriber,
  type UpdateConfigCallback,
  type UsageData,
} from 'jest-watcher';
import type { Config } from '@jest/types';
import FileNamePatternPrompt, { type SearchSources } from './prompt';
import type { PluginConfig } from '../types/Config';

export default class FileNamePlugin implements WatchPlugin {
  _stdin: NodeJS.ReadStream;

  _stdout: NodeJS.WriteStream;

  _prompt: Prompt;

  _projects: SearchSources;

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
    this._projects = [];
    this._usageInfo = {
      key: config.key || 'p',
      prompt: config.prompt || 'filter by a filename regex pattern',
    };
  }

  apply(jestHooks: JestHookSubscriber): void {
    jestHooks.onFileChange(({ projects }) => {
      this._projects = projects;
    });
  }

  onKey(key: string): void {
    this._prompt.put(key);
  }

  run(
    globalConfig: Config.GlobalConfig,
    updateConfigAndRun: UpdateConfigCallback,
  ): Promise<void> {
    const p = new FileNamePatternPrompt(this._stdout, this._prompt);
    p.updateSearchSources(this._projects);
    return new Promise((res, rej) => {
      p.run((testPathPattern) => {
        updateConfigAndRun({
          mode: 'watch',
          testPathPattern,
        });
        res();
      }, rej);
    });
  }

  getUsageInfo(): UsageData {
    return this._usageInfo;
  }
}
