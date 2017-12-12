import PrimitiveEE from './PrimitiveEE';



const EE = () => {
  let listeners = {};
  let destroyEE = PrimitiveEE();
  let everyEE = PrimitiveEE();
  let destroyed = false;

  const ee = {
    onEveryMessage (callback) {
      if (destroyed) {
        return () => {};
      }

      return everyEE.on(callback);
    },

    postMessage (eventName, ...args) {
      if (destroyed) {
        return;
      }

      if (!listeners.hasOwnProperty(eventName)) {
        return;
      }

      listeners[eventName].emit(...args);

      everyEE.emit(eventName, ...args);
    },

    onMessage (eventName, callback) {
      if (destroyed) {
        return () => {};
      }

      if (!listeners.hasOwnProperty(eventName)) {
        const listener = listeners[eventName] = PrimitiveEE();

        ee.onDestroy(() => {
          listener.cleanup();
          listeners[eventName] = null;
        });
      }

      return listeners[eventName].on(callback);
    },

    isDestroyed () {
      return destroyed;
    },

    destroy () {
      if (destroyed) {
        return;
      }

      destroyed = true;
      everyEE.cleanup();
      everyEE = null;
      destroyEE.emit();
      destroyEE.cleanup();
      destroyEE = null;
      listeners = null;
    },

    onDestroy (callback) {
      if (destroyed) {
        return () => {};
      }

      return destroyEE.on(callback);
    },

    childEE () {
      if (destroyed) {
        throw new Error('EE has already destroyed. you couldn\'t create any child');
      }

      const childEE = EE();

      const off = ee.onDestroy(() => {
        childEE.destroy();
      });

      childEE.onDestroy(off);

      childEE.postMessage = ee.postMessage;

      childEE.onMessage = (...args) => {
        const off = ee.onMessage(...args);

        childEE.onDestroy(off);

        return off;
      };

      return childEE;
    },

    connect (parentEE) {
      if (destroyed) {
        throw new Error('EE has already destroyed. you couldn\'t connect any child');
      }

      const off = parentEE.onDestroy(() => {
        ee.destroy();
      });

      ee.onDestroy(off);

      return ee;
    }
  };

  return ee;
};


export default EE;
