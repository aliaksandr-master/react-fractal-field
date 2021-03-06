import { isFunction, isString, isNil } from '../utils/lodash';



const allIsOk = () => undefined;

export default (...validators) => {
  validators = validators.filter((validator, index) => {
    if (isNil(validator)) {
      return false;
    }

    const validatorIsFunction = isFunction(validator);

    if (process.env.NODE_ENV !== 'production') {
      if (!validatorIsFunction) {
        throw new TypeError(`[FractalField] validator[${index}] is not a function`);
      }
    }

    return validatorIsFunction;
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

      if (!isNil(message)) {
        if (process.env.NODE_ENV !== 'production') {
          if (!isString(message)) {
            throw new TypeError('[FractalField] validator message must be string');
          }
        }

        return message;
      }
    }

    return undefined;
  };
};
