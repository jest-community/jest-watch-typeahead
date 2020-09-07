import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import type { Prompt } from 'jest-watcher';

const pluralize = (count: number, text: string) =>
  count === 1 ? text : `${text}s`;

export const printPatternMatches = (
  count: number,
  entity: string,
  pipe: NodeJS.WritableStream,
  extraText = '',
): void => {
  const pluralized = pluralize(count, entity);
  const result = count
    ? `\n\n Pattern matches ${count} ${pluralized}`
    : `\n\n Pattern matches no ${pluralized}`;

  pipe.write(result + extraText);
};

export const printStartTyping = (
  entity: string,
  pipe: NodeJS.WritableStream,
): void => {
  pipe.write(
    `\n\n ${chalk.italic.yellow(
      `Start typing to filter by a ${entity} regex pattern.`,
    )}`,
  );
};

export const printMore = (
  entity: string,
  pipe: NodeJS.WritableStream,
  more: number,
): void => {
  pipe.write(
    `\n   ${chalk.dim(`...and ${more} more ${pluralize(more, entity)}`)}`,
  );
};

export const printTypeaheadItem = (
  item: string,
  pipe: NodeJS.WritableStream,
): void => {
  pipe.write(`\n ${chalk.dim('\u203A')} ${item}`);
};

export const formatTypeaheadSelection = (
  item: string,
  index: number,
  activeIndex: number,
  prompt: Prompt,
): string => {
  if (index === activeIndex) {
    prompt.setPromptSelection(stripAnsi(item));
    return chalk.black.bgYellow(stripAnsi(item));
  }
  return item;
};
