import isFunction from 'lodash/isFunction';
import once from 'lodash/once';



export default () => {
  let listeners = [];
  let _destroyed = false;

  const on = (fn) => {
    if (_destroyed) {
      return () => {};
    }

    if (!isFunction(fn)) {
      throw new TypeError('callback must be a function');
    }

    listeners.push(fn);

    return once(() => {
      listeners = listeners.filter((cb) => cb !== fn);
    });
  };

  return {
    emit: (...args) => {
      if (_destroyed) {
        return null;
      }

      return listeners.forEach((fn) => fn(...args));
    },

    destroy () {
      if (_destroyed) {
        return;
      }

      _destroyed = true;
      listeners = [];
    },

    cleanup () {
      if (_destroyed) {
        return;
      }

      listeners = [];
    },

    length () {
      if (_destroyed) {
        return 0;
      }

      return listeners.length;
    },

    once (fn) {
      const off = on(once((...args) => {
        off();
        fn(...args);
      }));

      return off;
    },

    on
  };
};
