// @flow

import { Prompt } from 'jest-watcher';
import FileNamePatternPrompt, {
  type SearchSources,
} from './file_name_pattern_prompt';

type PluginConfig = {
  key?: string,
  prompt?: string,
};

class FileNamePlugin {
  _stdin: stream$Readable | tty$ReadStream;
  _stdout: stream$Writable | tty$WriteStream;
  _prompt: Prompt;
  _projects: SearchSources;
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
    this._projects = [];
    this._config = config;
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
        updateConfigAndRun({ mode: 'watch', testPathPattern: value });
        res();
      }, rej);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getUsageInfo() {
    return {
      key: this._config.key || 'p',
      prompt: this._config.prompt || 'filter by a filename regex pattern',
    };
  }
}

module.exports = FileNamePlugin;
