import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import PrimitiveEE from '../utils/PrimitiveEE';



const Stream = class Stream {
  constructor () {
    this._ee = PrimitiveEE();

    this.publish = this.publish.bind(this);
  }

  publish (id, ...args) {
    if (!id || !(isString(id) || isNumber(id))) {
      throw new TypeError('invalid id. must be non-empty number/string');
    }

    this._ee.emit(id, ...args);
  }

  subscribeAll (listener) {
    return this._ee.on(listener);
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


export const blur = new Stream();
export const focus = new Stream();
export const initialize = new Stream();
export const reset = new Stream();
export const submit = new Stream();
export const change = new Stream();
