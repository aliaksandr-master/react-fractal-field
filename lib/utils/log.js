import { error$ } from '../stream/global-streams';



export const logError = (...args) => {
  if (!error$.length()) {
    window.console && console.error && console.error('FractalField ERROR: ', ...args); // eslint-disable-line no-console, no-unused-expressions
  }

  error$.emit(...args);
};

const logCache = {};

export const logWarn = (error) => {
  if (logCache[error.message] === true) {
    return;
  }

  logCache[error.message] = true;
  window.console && console.warn && console.warn('FractalField WARNING: ', error.message, error.stack); // eslint-disable-line no-console, no-unused-expressions
};
