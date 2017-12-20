import memoize from 'lodash/memoize';
import isError from 'lodash/isError';
import { error } from './global';


/*eslint-disable no-console*/
const consoleError = window.console && console.error ? (...args) => console.error(...args) : () => {};
const consoleLog = window.console && console.log ? (...args) => console.log(...args) : () => {};
const consoleWarn = window.console && console.warn ? (...args) => console.warn(...args) : () => {};

export const logError = (...args) => {
  consoleError('ReactFractalField ERROR: ', ...args);

  error.publish(...args);
};

export const logWarn = memoize((...args) => {
  consoleWarn('ReactFractalField WARNING: ', ...args);
}, (...args) => args.map((arg) => isError(arg) ? arg.message : arg).join(','));


export const logDispatch = (window.console && console.log && console.time && console.group && console.timeEnd && console.groupEnd && process.env.NODE_ENV !== 'production') ? (enabled, store, { type, fieldID, payload }) => {
  if (!enabled) {
    return () => {};
  }

  const oldVersion = store.version;

  console.time('time spend of action');

  const label = `DISPATCH "${type}" (${fieldID}): `;

  return () => {
    const newState = store.getState();
    const newVersion = store.version;

    if (oldVersion !== newVersion) {
      console.group(label, payload);
      console.log('new state', newState);
      console.timeEnd('time spend of action');
      console.groupEnd(label);
    } else {
      console.groupCollapsed(label, payload);
      console.log('new state', newState);
      console.timeEnd('time spend of action');
      console.groupEnd(label);
    }
  };
} : () => () => {};
/*eslint-enable no-console*/