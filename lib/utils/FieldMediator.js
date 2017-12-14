import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import wrapDestroyed from '../utils/wrapDestroyed';
import Store from '../utils/Store';
import PrimitiveEE from '../utils/PrimitiveEE';
import { logError, logDispatch } from '../utils/log';
import reducer, { MOUNT, UNMOUNT, SUBMIT, SUBMIT_OK, SUBMIT_FAILED, SUBMIT_START, VALIDATE_EXCEPTION, NORMALIZE_EXCEPTION, FORMAT_EXCEPTION, FOCUS, TOUCH, CHANGE_VALIDITY, BLUR, CHANGE_VALUE, RENAME } from './FieldMediator.reducer';



export default class FractalMediator {

  constructor (id, parent = null, { debug = false } = {}) {
    this.id = id;
    this._parent = parent;
    this._destroyed = false;
    this._debug = (parent ? parent._debug : debug) || debug;
    this._store = parent ? parent._store : new Store(reducer);

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

  getState () {
    return this._store.getState().fields[this.id];
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
    if (err) {
      logError(err, 'normalize');
    }
  }

  sysFormatError (err) {
    this._dispatch(FORMAT_EXCEPTION, err);
    if (err) {
      logError(err, 'format');
    }
  }

  sysValidateError (err) {
    this._dispatch(VALIDATE_EXCEPTION, err);
    if (err) {
      logError(err, 'validate');
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

  changeValue (value) {
    const flush = this.transaction();

    this._dispatch(CHANGE_VALUE, value);
    this._dispatch(TOUCH);

    flush();
  }
}
