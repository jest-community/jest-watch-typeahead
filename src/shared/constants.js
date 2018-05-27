// @flow

const isWindows = process.platform === 'win32';

export const CLEAR = isWindows ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H';

export const KEYS = {
  A: 'a',
  ARROW_DOWN: '\u001b[B',
  ARROW_LEFT: '\u001b[D',
  ARROW_RIGHT: '\u001b[C',
  ARROW_UP: '\u001b[A',
  BACKSPACE: isWindows
    ? Buffer.from('08', 'hex').toString()
    : Buffer.from('7f', 'hex').toString(),
  C: 'c',
  CONTROL_C: '\u0003',
  CONTROL_D: '\u0004',
  ENTER: '\r',
  ESCAPE: '\u001b',
  F: 'f',
  I: 'i',
  O: 'o',
  P: 'p',
  Q: 'q',
  QUESTION_MARK: '?',
  R: 'r',
  S: 's',
  T: 't',
  U: 'u',
  W: 'w',
};

export const ICONS = {
  failed: isWindows ? '\u00D7' : '\u2715',
  pending: '\u25CB',
  success: isWindows ? '\u221A' : '\u2713',
};
