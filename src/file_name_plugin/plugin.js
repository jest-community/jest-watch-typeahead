// @flow

import { Prompt } from 'jest-watcher';
import { escapeStrForRegex } from 'jest-regex-util';
import FileNamePatternPrompt, { type SearchSources } from './prompt';
import { removeTrimmingDots } from '../lib/utils';

type PluginConfig = {
  key?: string,
  prompt?: string,
};

class FileNamePlugin {
  _stdin: stream$Readable | tty$ReadStream;

  _stdout: stream$Writable | tty$WriteStream;

  _prompt: Prompt;

  _projects: SearchSources;

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
    this._projects = [];
    this._usageInfo = {
      key: config.key || 'p',
      prompt: config.prompt || 'filter by a filename regex pattern',
    };
  }

  apply(jestHooks: Object) {
    jestHooks.onFileChange(({ projects }) => {
      this._projects = projects;
    });
  }

  onKey(key: string) {
    this._prompt.put(key);
  }

  run(globalConfig: Object, updateConfigAndRun: Function): Promise<void> {
    const p = new FileNamePatternPrompt(this._stdout, this._prompt);
    p.updateSearchSources(this._projects);
    return new Promise((res, rej) => {
      p.run(value => {
        updateConfigAndRun({
          mode: 'watch',
          testPathPattern: removeTrimmingDots(value)
            .split('/')
            .map(escapeStrForRegex)
            .join('/'),
        });
        res();
      }, rej);
    });
  }

  getUsageInfo() {
    return this._usageInfo;
  }
}

module.exports = FileNamePlugin;
