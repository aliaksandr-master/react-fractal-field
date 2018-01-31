import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import PrimitiveEE from '../utils/PrimitiveEE';



const BasicStream = class BasicStream {
  constructor () {
    const ee = PrimitiveEE();

    this.emit = ee.emit;
    this.on = ee.on;
  }
};



const Stream = class Stream extends BasicStream {
  publish (id, ...args) {
    if (!id || !(isString(id) || isNumber(id))) {
      throw new TypeError('[FractalField] invalid id. must be non-empty number/string');
    }

    this.emit(id, ...args);
  }

  subscribeAll (listener) {
    return this.on(listener);
  }

  subscribe (id, listener) {
    return this.subscribeAll((componentID, ...args) => {
      if (id !== componentID) {
        return;
      }

      listener(componentID, ...args);
    });
  }
};



const StreamGlobal = class StreamForAll extends BasicStream {
  publish (...args) {
    this.emit(...args);
  }

  subscribe (listener) {
    return this.on(listener);
  }
};



export const blur = new Stream();
export const focus = new Stream();
export const initialize = new Stream();
export const reset = new Stream();
export const submit = new Stream();
export const change = new Stream();
export const error = new StreamGlobal();
