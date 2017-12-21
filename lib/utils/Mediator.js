import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isError from 'lodash/isError';
import isNil from 'lodash/isNil';
import wrapDestroyed from '../utils/wrapDestroyed';
import Store from '../utils/Store';
import PrimitiveEE from '../utils/PrimitiveEE';
import { logLabeledError, logDispatch } from '../utils/log';
import reducer, { RESET, INIT, MOUNT, UNMOUNT, SUBMIT, SUBMIT_OK, SUBMIT_FAILED, SUBMIT_START, VALIDATE_EXCEPTION, NORMALIZE_EXCEPTION, FORMAT_EXCEPTION, FOCUS, TOUCH, CHANGE_VALIDITY, BLUR, CHANGE_VALUE, RENAME } from './Mediator.reducer';



export default class FractalMediator {

  constructor (id, parent = null, { debug = false } = {}) {
    this.id = id;
    this._parent = parent;
    this._destroyed = false;
    this._debug = (parent ? parent._debug : debug) || debug;
    this._store = parent ? parent._store : new Store(reducer);

    this._sysNormalizeErrorMessage = null;
    this._sysFormatErrorMessage = null;
    this._sysValidateErrorMessage = null;

    this.destroy = wrapDestroyed(this.destroy);
    this.onChange = wrapDestroyed(this.onChange, () => () => {});
    this.transaction = wrapDestroyed(this.transaction, () => () => {});
  }

  dehydrateNames (ids) {
    const fullState = this._store.getState();

    return ids.map((id) => fullState.fields[id].name);
  }

  destroy () {
    this._dispatch(UNMOUNT);
    this._destroyed = true;
  }

  transaction () {
    return this._store.transaction();
  }

  version () {
    return this._store.version;
  }

  mount (params = {}) {
    const parentID = this._parent ? this._parent.id : null;

    this._dispatch(MOUNT, { parentID, ...params });
  }

  init () {
    this._dispatch(INIT);
  }

  getState () {
    return this._store.getState().fields[this.id];
  }

  getFullState () {
    return this._store.getState();
  }

  _dispatch (type, payload) {
    const flush = this.transaction();

    const action = { type, fieldID: this.id, payload };

    const endDispatch = logDispatch(this._debug, this._store, action);

    this._store.dispatch(action);

    endDispatch();

    flush();
  }

  hasNamedChildren () {
    const fullState = this._store.getState();

    return fullState.tree[this.id].some((id) => !isNil(fullState.fields[id].name));
  }

  focus () {
    this._dispatch(FOCUS);
  }

  blur () {
    this._dispatch(BLUR);
  }

  submitStart () {
    this._dispatch(SUBMIT_START);
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
    this._dispatch(NORMALIZE_EXCEPTION, err);

    if (err && isError(err) && err.message !== this._sysNormalizeErrorMessage) {
      this._sysNormalizeErrorMessage = err.message;
      logLabeledError('normalize', err);
    } else if (!err) {
      this._sysNormalizeErrorMessage = null;
    }
  }

  sysFormatError (err) {
    this._dispatch(FORMAT_EXCEPTION, err);

    if (err && isError(err) && err.message !== this._sysFormatErrorMessage) {
      this._sysFormatErrorMessage = err.message;
      logLabeledError('format', err);
    } else if (!err) {
      this._sysFormatErrorMessage = null;
    }
  }

  sysValidateError (err) {
    this._dispatch(VALIDATE_EXCEPTION, err);

    if (err && isError(err) && err.message !== this._sysValidateErrorMessage) {
      this._sysValidateErrorMessage = err.message;
      logLabeledError('validate', err);
    } else if (!err) {
      this._sysValidateErrorMessage = null;
    }
  }

  changeValidity (error) {
    this._dispatch(CHANGE_VALIDITY, error || null);
  }

  onChange (listener) {
    return this._store.onChange(listener);
  }

  rename (name) {
    this._dispatch(RENAME, name);
  }

  reset () {
    this._dispatch(RESET);
  }

  changeValue (value) {
    const flush = this.transaction();

    this._dispatch(CHANGE_VALUE, value);
    this._dispatch(TOUCH);

    flush();
  }
}
