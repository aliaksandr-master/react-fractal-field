import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import cloneDeep from 'lodash/cloneDeep';
import setWith from 'lodash/setWith';


export default (host, path, value) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!isString(path) || (path && !/^(?:[a-zA-Z_$][a-zA-Z_$0-9]*|\[[0-9]+])(?:\.[a-zA-Z_$][a-zA-Z_$0-9]*|\[[0-9]+])*/.test(path))) {
      throw new Error(`path "${path}" has invalid format`);
    }
  }

  if (path === '') {
    return value;
  }

  return setWith(cloneDeep(host), path, value, (nsValue, key, nsObject) => {
    if (process.env.NODE_ENV !== 'production') {
      const isArrayKey = /^[0-9]+$/.test(key);

      if (Array.isArray(nsObject)) {
        if (!isArrayKey) {
          throw new Error(`you couldn't set key "${key}" into array. for path "${path}"`);
        }
      } else if (isPlainObject(nsObject)) {
        if (isArrayKey) {
          throw new Error(`you couldn't set array key "${key}" into object. for path "${path}"`);
        }
      }

      if (nsValue != null && !isPlainObject(nsValue) && !Array.isArray(nsValue)) {
        throw new Error(`you couldn't set key "${key}" into non-object value "${nsValue}". for path "${path}"`);
      }
    }
  });
};
