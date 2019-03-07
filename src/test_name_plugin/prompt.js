// @flow

import * as React from 'react';
import { render, Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import chalk from 'chalk';
import ansiEscapes from 'ansi-escapes';
import {
  Prompt,
  PatternPrompt,
  printPatternCaret,
  printRestoredPatternCaret,
} from 'jest-watcher';
import scroll, { type ScrollOptions } from '../lib/scroll';
import { formatTestNameByPattern, getTerminalWidth } from '../lib/utils';
import {
  formatTypeaheadSelection,
  printMore,
  printPatternMatches,
  printStartTyping,
  printTypeaheadItem,
} from '../lib/pattern_mode_helpers';

export type TestResult = {
  testResults: Array<{
    title: string,
  }>,
};

function PromptThing() {
  const [value, setValue] = React.useState('');

  const valueAsRegexp = new RegExp(value);
  const items = [
    { label: 'hah', value: 'thing number 1' },
    { label: 'hah2', value: 'thing number 2' },
  ].filter(item => valueAsRegexp.test(item.value));

  return (
    <Box flexDirection="column">
      <Text bold>Pattern Mode Usage</Text>
      <Box marginLeft={1} flexDirection="column">
        <Box>
          <Text>› Press Esc to exit pattern mode.</Text>
        </Box>
        <Box>
          <Text>› Press Enter to filter by a filenames regex pattern.</Text>
        </Box>

        <Box marginY={1}>
          <Box marginRight={1}>
            <Text>pattern ›</Text>
          </Box>
          <TextInput value={value} onChange={setValue} />
        </Box>
        <Box>
          {value.length > 0 ? (
            <Box flexDirection="column">
              <Text>Pattern matches {items.length} files</Text>
              <SelectInput items={items} limit={10} />
            </Box>
          ) : (
            <Text>Start typing to filter by a filename regex pattern.</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

render(<PromptThing />);

class TestNamePatternPrompt extends PatternPrompt {
  _cachedTestResults: Array<TestResult>;

  constructor(pipe: stream$Writable | tty$WriteStream, prompt: Prompt) {
    super(pipe, prompt);
    this._entityName = 'tests';
    this._cachedTestResults = [];
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
      printPatternMatches(
        total,
        'test',
        pipe,
        ` from ${chalk.yellow('cached')} test suites`,
      );

      const width = getTerminalWidth(pipe);
      const { start, end, index } = scroll(total, options);

      prompt.setPromptLength(total);

      matchedTests
        .slice(start, end)
        .map(name => formatTestNameByPattern(name, pattern, width - 4))
        .map((item, i) => formatTypeaheadSelection(item, i, index, prompt))
        .forEach(item => printTypeaheadItem(item, pipe));

      if (total > end) {
        printMore('test', pipe, total - end);
      }
    } else {
      printStartTyping('test name', pipe);
    }

    printRestoredPatternCaret(pattern, this._currentUsageRows, pipe);
  }

  _getMatchedTests(pattern: string) {
    let regex;

    try {
      regex = new RegExp(pattern, 'i');
    } catch (e) {
      return [];
    }

    return this._cachedTestResults.reduce((matchedTests, { testResults }) => {
      return matchedTests.concat(
        testResults
          .filter(({ title }) => regex.test(title))
          .map(({ title }) => title),
      );
    }, []);
  }

  updateCachedTestResults(testResults: Array<TestResult> = []) {
    this._cachedTestResults = testResults;
  }
}

module.exports = TestNamePatternPrompt;
