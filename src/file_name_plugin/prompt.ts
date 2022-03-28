import chalk from 'chalk';
import ansiEscapes from 'ansi-escapes';
import stringLength from 'string-length';
import {
  Prompt,
  PatternPrompt,
  printPatternCaret,
  printRestoredPatternCaret,
} from 'jest-watcher';
import { escapeStrForRegex } from 'jest-regex-util';
import fuzzysearch from 'fuzzysearch';
import type { Config } from '@jest/types';
import {
  highlight,
  getTerminalWidth,
  trimAndFormatPath,
  removeTrimmingDots,
} from '../lib/utils';
import {
  formatTypeaheadSelection,
  printMore,
  printPatternMatches,
  printStartTyping,
  printTypeaheadItem,
} from '../lib/pattern_mode_helpers';
import scroll, { ScrollOptions } from '../lib/scroll';

export type SearchSources = Array<{
  config: Config.ProjectConfig;
  testPaths: Array<string>;
}>;

export default class FileNamePatternPrompt extends PatternPrompt {
  _searchSources: SearchSources;

  constructor(pipe: NodeJS.WriteStream, prompt: Prompt) {
    super(pipe, prompt);
    this._entityName = 'filenames';
    this._searchSources = [];
  }

  _onChange(pattern: string, options: ScrollOptions): void {
    super._onChange(pattern, options);
    this._printTypeahead(pattern, options);
  }

  _printTypeahead(pattern: string, options: ScrollOptions): void {
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
      const width = getTerminalWidth(pipe as NodeJS.WriteStream);
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
          return highlight(path, filePath, pattern);
        })
        .map((item, i) => formatTypeaheadSelection(item, i, index, prompt))
        .forEach((item) => printTypeaheadItem(item, pipe));

      if (total > end) {
        printMore('file', pipe, total - end);
      }
    } else {
      printStartTyping('filename', pipe);
    }

    printRestoredPatternCaret(pattern, this._currentUsageRows, pipe);
  }

  _getMatchedTests(pattern: string): Array<{
    path: string;
    context: { config: Config.ProjectConfig };
  }> {
    return this._searchSources.reduce<
      Array<{
        path: string;
        context: { config: Config.ProjectConfig };
      }>
    >((tests, { testPaths, config }) => {
      return tests.concat(
        testPaths
          .filter((testPath) =>
            fuzzysearch(pattern.toLowerCase(), testPath.toLowerCase()),
          )
          .map((path) => ({
            path,
            context: { config },
          })),
      );
    }, []);
  }

  updateSearchSources(searchSources: SearchSources): void {
    this._searchSources = searchSources;
  }

  run(
    onSuccess: (value: string) => void,
    onCancel: () => void,
    options?: {
      header: string;
    },
  ): void {
    super.run(
      (value) => {
        onSuccess(
          removeTrimmingDots(value).split('').map(escapeStrForRegex).join('.*'),
        );
      },
      onCancel,
      options,
    );
  }
}
