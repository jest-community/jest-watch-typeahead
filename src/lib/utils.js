// @flow
/* eslint-disable no-param-reassign */
import path from 'path';
import chalk from 'chalk';
import slash from 'slash';
import stripAnsi from 'strip-ansi';
import type { ProjectConfig } from '../types/Config';

const relativePath = (config: ProjectConfig, testPath: string) => {
  testPath = path.relative(config.cwd || config.rootDir, testPath);
  const dirname = path.dirname(testPath);
  const basename = path.basename(testPath);
  return { basename, dirname };
};

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
    dirname = `...${dirname.slice(
      dirname.length - dirnameLength,
      dirname.length,
    )}`;
    return slash(chalk.dim(dirname + path.sep) + chalk.bold(basename));
  }

  if (basenameLength + 4 === maxLength) {
    return slash(chalk.dim(`...${path.sep}`) + chalk.bold(basename));
  }

  // can't fit dirname, but can fit trimmed basename
  return slash(
    chalk.bold(
      `...${basename.slice(basename.length - maxLength - 4, basename.length)}`,
    ),
  );
};

// $FlowFixMe
export const getTerminalWidth = (): number => process.stdout.columns;

export const highlight = (
  rawPath: string,
  filePath: string,
  pattern: string,
  rootDir: string,
) => {
  const trim = '...';
  const relativePathHead = './';

  const colorize = (str: string, start: number, end: number) =>
    chalk.dim(str.slice(0, start)) +
    chalk.reset(str.slice(start, end)) +
    chalk.dim(str.slice(end));

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

  let offset;
  let trimLength;

  if (filePath.startsWith(trim)) {
    offset = rawPath.length - filePath.length;
    trimLength = trim.length;
  } else if (filePath.startsWith(relativePathHead)) {
    offset = rawPath.length - filePath.length;
    trimLength = relativePathHead.length;
  } else {
    offset = rootDir.length + path.sep.length;
    trimLength = 0;
  }

  const start = match.index - offset;
  const end = start + match[0].length;
  return colorize(filePath, Math.max(start, 0), Math.max(end, trimLength));
};
