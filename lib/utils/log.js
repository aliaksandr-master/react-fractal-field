import memoize from 'lodash/memoize';
import isError from 'lodash/isError';
import { error } from './global';


/*eslint-disable no-console*/
const consoleError = window.console && console.error ? (...args) => console.error(...args) : () => {};
const consoleWarn = window.console && console.warn ? (...args) => console.warn(...args) : () => {};

export const consoleLog = window.console && console.log ? (...args) => console.log(...args) : () => {};
export const consoleTime = window.console && console.time ? (...args) => console.time(...args) : () => {};
export const consoleTimeEnd = window.console && console.timeEnd ? (...args) => console.timeEnd(...args) : () => {};

//export const logError = (...args) => {
//  consoleError('ReactFractalField ERROR: ', ...args);
//
//  error.publish(...args);
//};

export const logLabeledError = (label, ...args) => {
  consoleError(`[ReactFractalField ${label}]`, ...args);

  error.publish(...args);
};

export const logWarn = memoize((...args) => {
  consoleWarn('[ReactFractalField]', ...args);
}, (...args) => args.map((arg) => isError(arg) ? arg.message : arg).join(','));


export const logDispatch = (window.console && console.log && console.time && console.group && console.timeEnd && console.groupEnd && process.env.NODE_ENV !== 'production') ? (enabled, store, { type, fieldID, payload }) => {
  if (!enabled) {
    return () => {};
  }

  const oldVersion = store.version;

  const label = `[ReactFractalField] DISPATCH "${type}" (${fieldID}): `;

  console.time('time');

  return () => {
    const newState = store.getState();
    const newVersion = store.version;

    if (oldVersion !== newVersion) {
      console.group(label, isError(payload) ? `Error: ${payload.message}` : payload);
    } else {
      console.groupCollapsed(label, isError(payload) ? `Error: ${payload.message}` : payload);
    }
    console.log('state', newState);
    console.log('field state', newState[fieldID]);
    console.timeEnd('time');
    console.groupEnd(label);
  };
} : () => () => {};
/*eslint-enable no-console*/
