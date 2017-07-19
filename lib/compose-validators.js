import isFunction from 'lodash/isFunction';

const allIsOk = () => undefined;

export default (...validators) => {
  validators = validators.filter((validator, index) => {
    if (validator == null) {
      return false;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (!isFunction(validator)) {
        throw new TypeError(`validator[${index}] is not a function`);
      }
    }

    return isFunction(validator);
  });

  const len = validators.length;

  if (!len) {
    return allIsOk;
  }

  if (len === 1) {
    return validators[0];
  }

  return (value) => {
    for (let i = 0; i < len; i++) { // eslint-disable-line fp/no-loops
      const message = validators[i](value);

      if (message != null) {
        if (process.env.NODE_ENV !== 'production') {
          if (typeof message !== 'string') {
            throw new TypeError('validator message must be string');
          }
        }

        return message;
      }
    }

    return undefined;
  };
};
