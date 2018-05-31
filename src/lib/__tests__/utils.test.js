import stripAnsi from 'strip-ansi';
import { trimAndFormatPath } from '../utils';

test('trimAndFormatPath', () => {
  expect(
    stripAnsi(
      trimAndFormatPath(2, { cwd: '/hello/there' }, '/hello/there/to/you', 80),
    ),
  ).toEqual('to/you');
});
