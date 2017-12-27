import once from 'lodash/once';
import PrimitiveEE from '../utils/PrimitiveEE';
import wrapDestroyed from '../utils/wrapDestroyed';



export default class Store {
  static INIT_ACTION_TYPE = '@@INIT';

  constructor (reducer) {
    this._destroyed = false;
    this._transactions = 0;
    this.version = 0;
    this._reducer = reducer;
    this._state = this._reducer(undefined, { type: Store.INIT_ACTION_TYPE });
    this._onChange$ = PrimitiveEE();

    this.destroy = wrapDestroyed(this.destroy);
    this.dispatch = wrapDestroyed(this.dispatch);
    this.transaction = wrapDestroyed(this.transaction);
  }

  transaction (/*label*/) {
    const version = this.version;

    ++this._transactions;

    return once(() => {
      --this._transactions;

      if (this._transactions <= 0) {
        this._transactions = 0;

        if (this.version !== version) {
          this._triggerChange();
        }
      }
    });
  }

  _triggerChange () {
    this._onChange$.emit();
  }

  onChange (listener) {
    return this._onChange$.on(listener);
  }

  onceChange (listener) {
    return this._onChange$.once(listener);
  }

  dispatch (action) {
    const newState = this._reducer(this._state, action);

    if (newState !== this._state) {
      this.version++;
      this._state = newState;

      if (!this._transactions) {
        this._triggerChange();
      }
    }
  }

  getState () {
    return this._state;
  }

  destroy () {
    this._destroyed = true;
    this._onChange$.destroy();
    this._state = null;
  }
}
