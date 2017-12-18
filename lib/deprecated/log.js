import memoize from 'lodash/memoize';
import isError from 'lodash/isError';
import { error$ } from './global-streams';


/*eslint-disable no-console*/
const consoleError = window.console && console.error ? (...args) => console.error(...args) : () => {};
const consoleLog = window.console && console.log ? (...args) => console.log(...args) : () => {};
const consoleWarn = window.console && console.warn ? (...args) => console.warn(...args) : () => {};

export const logError = (...args) => {
  consoleError('ReactFractalField ERROR: ', ...args); // eslint-disable-line no-unused-expressions

  error$.emit(...args);
};

export const logWarn = memoize((...args) => {
  consoleWarn('ReactFractalField WARNING: ', ...args);
}, (...args) => args.map((arg) => isError(arg) ? arg.message : arg).join(','));
/*eslint-enable no-console*/
