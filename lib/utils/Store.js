import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';
import once from 'lodash/once';
import PrimitiveEE from './PrimitiveEE';
import reducer from './reducer';
import wrapDestroyed from './wrapDestroyed';



export default class Store {
  static INIT_ACTION_TYPE = 'INIT';

  constructor (initialState, actionReducersMap) {
    this._destroyed = false;
    this._transactions = 0;
    this.version = 0;
    this._reducer = reducer(initialState, actionReducersMap);
    this._state = this._reducer(this._state, { type: Store.INIT_ACTION_TYPE });
    this._onChange$ = PrimitiveEE();

    this.destroy = wrapDestroyed(this.destroy);
    this.dispatch = wrapDestroyed(this.dispatch);
    this.transaction = wrapDestroyed(this.transaction);
  }

  transaction () {
    const version = this.version;

    //if (!this._transactions) {
    //  console.time('time spend');
    //}

    ++this._transactions;

    return once(() => {
      --this._transactions;

      if (this._transactions <= 0) {
        this._transactions = 0;

        //console.timeEnd('time spend');

        if (this.version !== version) {
          this._onChange$.emit(this);
        }
      }
    });
  }

  onChange (listener) {
    return this._onChange$.on(listener);
  }

  dispatch (action) {
    const newState = this._reducer(this._state, action);

    if (newState !== this._state) {
      this.version++;
      this._state = newState;

      if (!this._transactions) {
        this._onChange$.emit(this);
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
