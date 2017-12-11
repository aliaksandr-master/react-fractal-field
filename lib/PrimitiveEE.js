import isFunction from 'lodash/isFunction';
import once from 'lodash/once';
import without from 'lodash/without';
import over from 'lodash/over';



export default () => {
  let listeners = [];
  let fire = () => {};
  let _destroyed = false;

  const on = (callback) => {
    if (_destroyed) {
      return () => {};
    }

    if (!isFunction(callback)) {
      throw new TypeError('callback must be a function');
    }

    listeners.push(callback);

    fire = over(listeners);

    return once(() => {
      if (!listeners.length) {
        return;
      }

      listeners = without(listeners, callback);

      fire = over(listeners);
    });
  };

  return {
    emit: (...args) => {
      if (_destroyed) {
        return null;
      }

      return fire(...args);
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

    once (callback) {
      const off = on(once((...args) => {
        off();
        callback(...args);
      }));

      return off;
    },

    on
  };
};
