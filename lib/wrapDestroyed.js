

export default function (func, defaults = () => undefined) {
  return function (...args) {
    if (this._destroyed) { // eslint-disable-line no-invalid-this
      return defaults(...args);
    }

    return func.apply(this, args); // eslint-disable-line no-invalid-this
  };
}
