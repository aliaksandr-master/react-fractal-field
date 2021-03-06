import { isNil, isError } from '../utils/lodash';
import wrapDestroyed from '../utils/wrapDestroyed';
import { logLabeledError, logDispatch } from '../utils/log';
import Store from './Store';
import reducer, { RESET, INIT, MOUNT, UNMOUNT, SUBMIT, SUBMIT_OK, SUBMIT_FAILED, SUBMIT_START, VALIDATE_EXCEPTION, NORMALIZE_EXCEPTION, FORMAT_EXCEPTION, FOCUS, TOUCH, CHANGE_VALIDITY, BLUR, CHANGE_VALUE, RENAME } from './Mediator.reducer';



const errorIsEqual = (err1, err2) => err1 === err2 || (isError(err2) && isError(err1) && err1.message === err2.message);


export default class FractalMediator {
  /**
   * @constructor
   * @param {String} id
   * @param {FractalMediator?} parent
   * @param {Object} options
   * @param {Boolean} options.debug
   * */

  constructor (id, parent = null, { debug = false } = {}) {
    this.id = id;
    this._parent = parent;
    this._destroyed = false;
    this._debug = (parent ? parent._debug : debug) || debug;
    this._store = parent ? parent._store : new Store(reducer);
    this._clothesIsolatedMediator = this._parent ? this._parent._clothesIsolatedMediator : this;

    this._prevError = null;
    this._prevNormalizeError = null;
    this._prevFormatError = null;
    this._prevValidateError = null;

    [
      'destroy',
      '_dispatch',
      'mount',
      'init',
      'focus',
      'blur',
      'submitStart',
      'submit',
      'submitFailed',
      'submitDone',
      'sysNormalizeError',
      'sysValidateError',
      'sysFormatError',
      'changeValidity',
      'rename',
      'reset',
      'touch',
      'changeValue'
    ].forEach((name) => {
      this[name] = wrapDestroyed(this[name]);
    });

    this.onChange = wrapDestroyed(this.onChange, () => () => {});
    this.transaction = wrapDestroyed(this.transaction, () => () => {});
  }

  getClothesIsolatedMediator () {
    return this._clothesIsolatedMediator;
  }

  onChange (listener) {
    return this._store.onChange(listener);
  }

  onceChange (listener) {
    return this._store.onceChange(listener);
  }

  _dispatch (type, payload) {
    const flush = this.transaction('_dispatch');

    const action = { type, fieldID: this.id, payload };

    const endDispatch = logDispatch(this._debug, this._store, action);

    this._store.dispatch(action);

    endDispatch();

    flush();
  }

  transaction (...args) {
    return this._store.transaction(...args);
  }

  version () {
    return this._store.version;
  }

  getState () {
    return this.getFullState()[this.id];
  }

  getFullState () {
    return this._store.getState();
  }

  dehydrateNames (ids) {
    const fullState = this.getFullState();

    return ids.map((id) => fullState[id].name);
  }

  hasNamedChildren () {
    const fullState = this.getFullState();

    return fullState[this.id].children.some((id) => !isNil(fullState[id].name));
  }


  // handlers

  destroy () {
    this._dispatch(UNMOUNT);
    this._destroyed = true;
  }

  mount (params = {}) {
    const parentID = this._parent ? this._parent.id : null;

    this._dispatch(MOUNT, { parentID, ...params });
  }

  init () {
    this._dispatch(INIT);
  }

  focus () {
    this._dispatch(FOCUS);
  }

  blur () {
    this._dispatch(BLUR);
  }

  submitStart ({ touch = true } = {}) {
    const flush = this.transaction();

    this._dispatch(SUBMIT_START);

    if (touch) {
      this.touch();
    }

    flush();
  }

  submit () {
    this._dispatch(SUBMIT);
  }

  submitDone () {
    this._dispatch(SUBMIT_OK);
  }

  submitFailed () {
    this._dispatch(SUBMIT_FAILED);
  }

  sysNormalizeError (err) {
    if (errorIsEqual(this._prevNormalizeError, err)) {
      return;
    }

    this._prevNormalizeError = err;

    this._dispatch(NORMALIZE_EXCEPTION, err);

    if (err) {
      logLabeledError('normalize', err);
    }
  }

  sysFormatError (err) {
    if (errorIsEqual(this._prevFormatError, err)) {
      return;
    }

    this._prevFormatError = err;

    this._dispatch(FORMAT_EXCEPTION, err);

    if (err) {
      logLabeledError('format', err);
    }
  }

  sysValidateError (err) {
    if (errorIsEqual(this._prevValidateError, err)) {
      return;
    }

    this._prevValidateError = err;

    this._dispatch(VALIDATE_EXCEPTION, err);

    if (err) {
      logLabeledError('validate', err);
    }
  }

  changeValidity (error) {
    error = error || null;

    if (errorIsEqual(this._prevError, error)) {
      return;
    }

    this._prevError = error;

    this._dispatch(CHANGE_VALIDITY, error);
  }

  rename (name) {
    this._dispatch(RENAME, name);
  }

  reset (initialValue) {
    this._dispatch(RESET, initialValue);
  }

  touch () {
    this._dispatch(TOUCH);
  }

  changeValue (value, { touch = true } = {}) {
    const flush = this.transaction('changeValue');

    this._dispatch(CHANGE_VALUE, value);

    if (touch) {
      this.touch();
    }

    flush();
  }
}
