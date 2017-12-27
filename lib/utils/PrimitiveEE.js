export default () => {
  let listeners = [];
  let _destroyed = false;

  const on = (fn) => {
    if (_destroyed) {
      return () => {};
    }

    if (typeof fn !== 'function') { // eslint-disable-line lodash/prefer-lodash-typecheck
      throw new TypeError('callback must be a function');
    }

    listeners.push(fn);

    let fired = false;

    return () => {
      if (fired) {
        return;
      }

      fired = true;

      listeners = listeners.filter((cb) => cb !== fn);
    };
  };

  return {
    emit: (...args) => {
      if (_destroyed) {
        return;
      }

      listeners.forEach((fn) => fn(...args));
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
      let fired = false;

      const off = on((...args) => {
        if (fired) {
          return;
        }

        fired = true;

        off();
        fn(...args);
      });

      return off;
    },

    on
  };
};
