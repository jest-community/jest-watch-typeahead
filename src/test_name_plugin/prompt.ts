import chalk from 'chalk';
import ansiEscapes from 'ansi-escapes';
import {
  Prompt,
  PatternPrompt,
  printPatternCaret,
  printRestoredPatternCaret,
} from 'jest-watcher';
import type { TestResult } from '@jest/test-result';
import { escapeStrForRegex } from 'jest-regex-util';
import scroll, { ScrollOptions } from '../lib/scroll';
import {
  formatTestNameByPattern,
  getTerminalWidth,
  removeTrimmingDots,
} from '../lib/utils';
import {
  formatTypeaheadSelection,
  printMore,
  printPatternMatches,
  printStartTyping,
  printTypeaheadItem,
} from '../lib/pattern_mode_helpers';

export default class TestNamePatternPrompt extends PatternPrompt {
  _cachedTestResults: Array<TestResult>;

  _offset: number;

  constructor(pipe: NodeJS.WritableStream, prompt: Prompt) {
    super(pipe, prompt);
    this._entityName = 'tests';
    this._cachedTestResults = [];
    this._offset = -1;
  }

  _onChange(pattern: string, options: ScrollOptions): void {
    super._onChange(pattern, options);
    this._offset = options.offset;
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
      printPatternMatches(
        total,
        'test',
        pipe,
        ` from ${chalk.yellow('cached')} test suites`,
      );

      const width = getTerminalWidth(pipe as NodeJS.WriteStream);
      const { start, end, index } = scroll(total, options);

      prompt.setPromptLength(total);

      matchedTests
        .slice(start, end)
        .map((name) => formatTestNameByPattern(name, pattern, width - 4))
        .map((item, i) => formatTypeaheadSelection(item, i, index, prompt))
        .forEach((item) => printTypeaheadItem(item, pipe));

      if (total > end) {
        printMore('test', pipe, total - end);
      }
    } else {
      printStartTyping('test name', pipe);
    }

    printRestoredPatternCaret(pattern, this._currentUsageRows, pipe);
  }

  _getMatchedTests(pattern: string): string[] {
    let regex: RegExp;

    try {
      regex = new RegExp(pattern, 'i');
    } catch (e) {
      return [];
    }

    return this._cachedTestResults.reduce<string[]>(
      (matchedTests, { testResults }) => {
        return matchedTests.concat(
          testResults
            .filter(({ fullName }) => regex.test(fullName))
            .map(({ fullName }) => fullName),
        );
      },
      [],
    );
  }

  updateCachedTestResults(testResults: Array<TestResult> = []): void {
    this._cachedTestResults = testResults;
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
        const preparedPattern = escapeStrForRegex(removeTrimmingDots(value));
        const useExactMatch = this._offset !== -1;
        onSuccess(useExactMatch ? `^${preparedPattern}$` : preparedPattern);
      },
      onCancel,
      options,
    );
  }
}
