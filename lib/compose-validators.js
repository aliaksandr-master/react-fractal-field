export default (...validators) => {
  if (__ASSERTS_ENABLED__) {
    validators.forEach((func) => {
      if (typeof func !== 'function') {
        throw new TypeError('compose argument must be a function');
      }
    });
  }

  return (value) => {
    for (let i = 0; i < validators.length; i++) {
      const message = validators[i](value);

      if (message != null) {
        return message;
      }
    }

    return undefined;
  };
};
