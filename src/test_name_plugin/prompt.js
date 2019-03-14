// @flow

import * as React from 'react';
import { render, Box, Text, Color, StdinContext } from 'ink';
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
  testResults: Array<{ title: string }>,
};

function useKeyHandler(keyHandler) {
  const { stdin, setRawMode } = React.useContext(StdinContext);

  React.useEffect(() => {
    setRawMode(true);
    stdin.on('keypress', keyHandler);
    return () => {
      stdin.off('keypress', keyHandler);
      setRawMode(false);
    };
  }, [keyHandler, stdin, setRawMode]);
}

function useIsScrolling() {
  const [isScrolling, setIsScrolling] = React.useState(false);
  useKeyHandler((str, key) => {
    setIsScrolling(key.name === 'up' || key.name === 'down');
  });

  return isScrolling;
}

const ArrowThing = () => (
  <Box marginRight={1}>
    <Text dim>{'\u203A'}</Text>
  </Box>
);

const PressKeyTo = ({
  keyboardKey,
  action,
}: {
  keyboardKey: string,
  action: string,
}) => (
  <Box>
    <ArrowThing />
    <Text dim>Press</Text>
    <Box marginX={1}>
      <Text>{keyboardKey}</Text>
    </Box>
    <Text dim>to {action}.</Text>
  </Box>
);

const filterItems = (
  pattern: string,
  items: Array<{ label: string, value: string }>,
) => {
  let regex;

  try {
    regex = new RegExp(pattern, 'i');
  } catch (e) {
    return [];
  }

  return items.filter(item => regex.test(item.value));
};

function PromptThing() {
  const [value, setValue] = React.useState('');
  const isScrolling = useIsScrolling();

  const items = filterItems(value, [
    { label: 'hah', value: 'thing number 1' },
    { label: 'hah2', value: 'thing number 2' },
  ]);
  const limit = 10;

  const unrenderedItems = items.length - limit;

  return (
    <Box flexDirection="column">
      <Text bold>Pattern Mode Usage</Text>
      <Box marginLeft={1} flexDirection="column">
        <PressKeyTo keyboardKey="Esc" action="exit pattern mode" />
        <PressKeyTo
          keyboardKey="Enter"
          action="filter by a filenames regex pattern"
        />

        <Box marginY={1}>
          <Box marginRight={1}>
            <Text>pattern</Text>
          </Box>
          <ArrowThing />
          <TextInput value={value} onChange={setValue} />
        </Box>
        {value.length === 0 ? (
          <Color yellow inverse>
            Start typing to filter by a filename regex pattern.
          </Color>
        ) : (
          <Box flexDirection="column">
            <Text>Pattern matches {items.length} files.</Text>
            {isScrolling ? (
              <SelectInput items={items} limit={limit} />
            ) : (
              <Box marginLeft={2} flexDirection="column">
                {items.slice(0, limit).map(i => (
                  <Box key={i.value}>
                    <Text>{i.label}</Text>
                  </Box>
                ))}
              </Box>
            )}
            {unrenderedItems > 0 && (
              <Box marginLeft={4}>
                <Color dim>…and {unrenderedItems} more files</Color>
              </Box>
            )}
          </Box>
        )}
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
