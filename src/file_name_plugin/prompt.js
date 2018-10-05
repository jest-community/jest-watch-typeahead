// @flow

import chalk from 'chalk';
import ansiEscapes from 'ansi-escapes';
import stringLength from 'string-length';
import {
  Prompt,
  PatternPrompt,
  printPatternCaret,
  printRestoredPatternCaret,
} from 'jest-watcher';
import { highlight, getTerminalWidth, trimAndFormatPath } from '../lib/utils';
import {
  formatTypeaheadSelection,
  printMore,
  printPatternMatches,
  printStartTyping,
  printTypeaheadItem,
} from '../lib/pattern_mode_helpers';
import scroll, { type ScrollOptions } from '../lib/scroll';
import type { ProjectConfig } from '../types/Config';

export type SearchSources = Array<{|
  config: ProjectConfig,
  testPaths: Array<string>,
|}>;

export default class FileNamePatternPrompt extends PatternPrompt {
  _searchSources: SearchSources;

  constructor(pipe: stream$Writable | tty$WriteStream, prompt: Prompt) {
    super(pipe, prompt);
    this._entityName = 'filenames';
    this._searchSources = [];
  }

  _onChange(pattern: string, options: ScrollOptions) {
    super._onChange(pattern, options);
    this._printTypeahead(pattern, options);
  }

  _printTypeahead(pattern: string, options: ScrollOptions) {
    const matchedTests = this._getMatchedTests(pattern);
    const total = matchedTests.length;
    const pipe = this._pipe;
    const prompt = this._prompt;

    printPatternCaret(pattern, pipe);

    pipe.write(ansiEscapes.cursorLeft);

    if (pattern) {
      printPatternMatches(total, 'file', pipe);

      const prefix = `  ${chalk.dim('\u203A')} `;
      const padding = stringLength(prefix) + 2;
      const width = getTerminalWidth(pipe);
      const { start, end, index } = scroll(total, options);

      prompt.setPromptLength(total);

      matchedTests
        .slice(start, end)
        .map(({ path, context }) => {
          const filePath = trimAndFormatPath(
            padding,
            context.config,
            path,
            width,
          );
          return highlight(path, filePath, pattern, context.config.rootDir);
        })
        .map((item, i) => formatTypeaheadSelection(item, i, index, prompt))
        .forEach(item => printTypeaheadItem(item, pipe));

      if (total > end) {
        printMore('file', pipe, total - end);
      }
    } else {
      printStartTyping('filename', pipe);
    }

    printRestoredPatternCaret(pattern, this._currentUsageRows, pipe);
  }

  _getMatchedTests(
    pattern: string,
  ): Array<{ path: string, context: { config: ProjectConfig } }> {
    let regex;

    try {
      regex = new RegExp(pattern, 'i');
    } catch (e) {
      return [];
    }

    return this._searchSources.reduce((tests, { testPaths, config }) => {
      return tests.concat(
        testPaths.filter(testPath => regex.test(testPath)).map(path => ({
          path,
          context: { config },
        })),
      );
    }, []);
  }

  updateSearchSources(searchSources: SearchSources) {
    this._searchSources = searchSources;
  }
}
