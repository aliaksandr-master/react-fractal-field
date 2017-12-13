import memoize from 'lodash/memoize';
import isError from 'lodash/isError';
import { error$ } from '../stream/global-streams';


/*eslint-disable no-console*/
export const logError = (...args) => {
  if (!error$.length()) {
    window.console && console.error && console.error('FractalField ERROR: ', ...args); // eslint-disable-line no-unused-expressions
  }

  error$.emit(...args);
};

export const logWarn = window.console && console.warn ? memoize((...args) => {
  console.warn('FractalField WARNING: ', ...args);
}, (...args) => args.map((arg) => isError(arg) ? arg.message : arg).join(',')) : () => {};


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
