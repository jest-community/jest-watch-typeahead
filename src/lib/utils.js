// @flow
/* eslint-disable no-param-reassign */
import path from 'path';
import chalk from 'chalk';
import slash from 'slash';
import stripAnsi from 'strip-ansi';
import type { ProjectConfig } from '../types/Config';

const TRIMMING_DOTS = '...';
const ENTER = '⏎';

const relativePath = (config: ProjectConfig, testPath: string) => {
  testPath = path.relative(config.cwd || config.rootDir, testPath);
  const dirname = path.dirname(testPath);
  const basename = path.basename(testPath);
  return { basename, dirname };
};

const colorize = (str: string, start: number, end: number) =>
  chalk.dim(str.slice(0, start)) +
  chalk.reset(str.slice(start, end)) +
  chalk.dim(str.slice(end));

export const trimAndFormatPath = (
  pad: number,
  config: ProjectConfig,
  testPath: string,
  columns: number,
): string => {
  const maxLength = columns - pad;
  const relative = relativePath(config, testPath);
  const { basename } = relative;
  let { dirname } = relative;

  // length is ok
  if ((dirname + path.sep + basename).length <= maxLength) {
    return slash(chalk.dim(dirname + path.sep) + chalk.bold(basename));
  }

  // we can fit trimmed dirname and full basename
  const basenameLength = basename.length;
  if (basenameLength + 4 < maxLength) {
    const dirnameLength = maxLength - 4 - basenameLength;
    dirname = `${TRIMMING_DOTS}${dirname.slice(
      dirname.length - dirnameLength,
      dirname.length,
    )}`;
    return slash(chalk.dim(dirname + path.sep) + chalk.bold(basename));
  }

  if (basenameLength + 4 === maxLength) {
    return slash(
      chalk.dim(`${TRIMMING_DOTS}${path.sep}`) + chalk.bold(basename),
    );
  }
  // can't fit dirname, but can fit trimmed basename
  return slash(chalk.bold(`${TRIMMING_DOTS}${basename.slice(-maxLength + 3)}`));
};

export const getTerminalWidth = (
  pipe: stream$Writable | tty$WriteStream = process.stdout,
  // $FlowFixMe
): number => pipe.columns;

export const highlight = (
  rawPath: string,
  filePath: string,
  pattern: string,
  rootDir: string,
) => {
  const relativePathHead = './';

  let regexp;

  try {
    regexp = new RegExp(pattern, 'i');
  } catch (e) {
    return chalk.dim(filePath);
  }

  rawPath = stripAnsi(rawPath);
  filePath = stripAnsi(filePath);
  const match = rawPath.match(regexp);

  if (!match) {
    return chalk.dim(filePath);
  }

  const offset = rawPath.length - filePath.length;

  let trimLength;
  if (filePath.startsWith(TRIMMING_DOTS)) {
    trimLength = TRIMMING_DOTS.length;
  } else if (filePath.startsWith(relativePathHead)) {
    trimLength = relativePathHead.length;
  } else {
    trimLength = 0;
  }

  const start = match.index - offset;
  const end = start + match[0].length;
  return colorize(filePath, Math.max(start, 0), Math.max(end, trimLength));
};

export const formatTestNameByPattern = (
  testName: string,
  pattern: string,
  width: number,
) => {
  const inlineTestName = testName.replace(/(\r\n|\n|\r)/gm, ENTER);

  let regexp;

  try {
    regexp = new RegExp(pattern, 'i');
  } catch (e) {
    return chalk.dim(inlineTestName);
  }

  const match = inlineTestName.match(regexp);

  if (!match) {
    return chalk.dim(inlineTestName);
  }

  // $FlowFixMe
  const startPatternIndex = Math.max(match.index, 0);
  const endPatternIndex = startPatternIndex + match[0].length;

  const testNameFitsInTerminal = inlineTestName.length <= width;
  if (testNameFitsInTerminal) {
    return colorize(inlineTestName, startPatternIndex, endPatternIndex);
  }

  const numberOfTruncatedChars =
    TRIMMING_DOTS.length + inlineTestName.length - width;
  const end = Math.max(endPatternIndex - numberOfTruncatedChars, 0);
  const truncatedTestName = inlineTestName.slice(numberOfTruncatedChars);

  const shouldHighlightDots = startPatternIndex <= numberOfTruncatedChars;
  if (shouldHighlightDots) {
    return colorize(
      TRIMMING_DOTS + truncatedTestName,
      0,
      end + TRIMMING_DOTS.length,
    );
  }

  const start = startPatternIndex - numberOfTruncatedChars;
  return colorize(
    TRIMMING_DOTS + truncatedTestName,
    start + TRIMMING_DOTS.length,
    end + TRIMMING_DOTS.length,
  );
};

export const removeTrimmingDots = (value: string): string => {
  if (value.startsWith(TRIMMING_DOTS)) {
    return value.slice(TRIMMING_DOTS.length);
  }
  return value;
};
