import PropTypes from 'prop-types';
import React, { Component } from 'react';
import get from 'lodash/get';
import isNaN from 'lodash/isNaN';
import isFunction from 'lodash/isFunction';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import debounce from 'lodash/debounce';
import EE, { PrimitiveEE } from './EE';
import composeValidators from './compose-validators';
import reducer, {
  changeValueActionCreator,
  changeChildFieldMetaActionCreator,
  touchActionCreator,
  submitActionCreator,
  submitFailedActionCreator,
  submitPendingActionCreator,
  submitDoneActionCreator,
  changeValueFieldActionCreator,
  changeLocalErrorActionCreator,
  changeForeignErrorActionCreator,
  removeChildFieldMetaActionCreator
} from './FractalField.store';
import children from './children';


const EVENT_MOUNT_CHILD_FIELD = 'MOUNT_CHILD_FIELD';
const EVENT_CHANGE_NAME_OF_CHILD_FIELD = 'CHANGE_NAME_OF_CHILD_FIELD';
const EVENT_FORM_WAS_SUBMITTED = 'FORM_WAS_SUBMITTED';
const EVENT_CHILD_WAS_TOUCHED = 'CHILD_WAS_TOUCHED';
const EVENT_UNMOUNT_CHILD_FIELD = 'UNMOUNT_CHILD_FIELD';
const EVENT_SET_CHILD_FIELD_VALUE = 'SET_CHILD_FIELD_VALUE';
const EVENT_CHANGE_CHILD_FIELD_VALUE = 'CHANGE_CHILD_FIELD_VALUE';


let inc = 0;


// global buses
const submit$ = EE();
const change$ = EE();
const reset$ = EE();
const initialize$ = EE();
const error$ = PrimitiveEE();

export const reset = (id) => reset$.sendMessage(id);
export const submit = (id) => submit$.sendMessage(id);
export const change = (id, name, value) => change$.sendMessage(id, name, value);
export const initialize = (id, obj) => initialize$.sendMessage(id, obj);
export const onError = (listener) => error$.on(listener);

const logError = (...args) => {
  if (!error$.length()) {
    window.console && console.error && console.error('FractalField ERROR: ', ...args); // eslint-disable-line no-console, no-unused-expressions
  }

  error$.emit(...args);
};

const logCache = {};

const logWarn = (error) => {
  if (logCache[error.message] === true) {
    return;
  }

  logCache[error.message] = true;
  window.console && console.warn && console.warn('FractalField WARN: ', error.message, error.stack); // eslint-disable-line no-console, no-unused-expressions
};



const logDeprecated = (message) => {
  if (logCache[message] === true) {
    return;
  }

  logCache[message] = true;

  window.console && console.warn && console.warn(`FractalField DEPRECATION: ${message}`); // eslint-disable-line no-console, no-unused-expressions
};



const checkName = (isForm, name) => {
  if (isForm) {
    if (name !== null) {
      throw new Error('FractalField: name must be null. because this component is isolated!');
    }
  } else {
    if (!name) {
      throw new Error('FractalField: name must be specified!');
    }
  }

  if (name !== null) {
    if (!name || !/^(?:[a-zA-Z_$][a-zA-Z_$0-9]*|\[[0-9]+])(?:\.[a-zA-Z_$][a-zA-Z_$0-9]*|\[[0-9]+])*/.test(name)) {
      throw new Error(`name "${name}" has invalid format`);
    }
  }
};


export default class FractalField extends Component {
  static propTypes = {
    id: PropTypes.string,
    pure: PropTypes.bool,
    name: PropTypes.string,
    children: PropTypes.oneOfType([ PropTypes.node, PropTypes.func ]).isRequired,
    strictTypes: PropTypes.bool,
    initialValue: PropTypes.any,
    reinitialize: PropTypes.bool,
    singleSubmit: PropTypes.bool,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    exception: PropTypes.string,
    normalize: PropTypes.func,
    format: PropTypes.func,
    validate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]),
    preFormat: PropTypes.func,
    preNormalize: PropTypes.func,
    preValidate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ])
  };

  static defaultProps = {
    id: null,
    name: null,
    pure: false,
    strictTypes: true,
    reinitialize: false,
    singleSubmit: true,
    onSubmit: () => {},
    onChange: () => {},
    format: (value) => value,
    validate: (value) => undefined,
    normalize: (value) => value,
    exception: 'Invalid',
    preFormat: (value) => value,
    preValidate: (value) => undefined,
    preNormalize: (value) => value
  };


  // context
  static childContextTypes = {
    _formMediator$: PropTypes.object
  };

  static contextTypes = {
    _formMediator$: PropTypes.object
  };

  getChildContext () {
    return {
      _formMediator$: this._selfChild$
    };
  }


  // state management
  initState () {
    this._state = this.state = reducer(undefined, {});

    this._$setState = debounce(() => {
      if (this._unmounted) {
        return;
      }

      this.setState(() => this._state); // eslint-disable-line react/no-set-state
    }, 0);
  }

  getState () {
    return this._state;
  }

  dispatch (action) {
    const prevState = this._state;

    this._state = reducer(prevState, action);

    if (this._state !== prevState) {
      this._$setState();
    }

    return this._state;
  }

  changeValueAction (value) {
    return this.dispatch(changeValueActionCreator(value));
  }

  touchAction () {
    return this.dispatch(touchActionCreator());
  }

  submitAction () {
    return this.dispatch(submitActionCreator());
  }

  changeValueFieldAction (name, value) {
    return this.dispatch(changeValueFieldActionCreator(name, value));
  }

  changeLocalErrorAction (error) {
    return this.dispatch(changeLocalErrorActionCreator(error));
  }

  changeForeignErrorAction (error) {
    return this.dispatch(changeForeignErrorActionCreator(error));
  }

  changeChildFieldMetaAction (name, valid) {
    return this.dispatch(changeChildFieldMetaActionCreator(name, valid));
  }

  removeChildFieldMetaAction (name) {
    return this.dispatch(removeChildFieldMetaActionCreator(name));
  }

  submitFailedAction () {
    return this.dispatch(submitFailedActionCreator());
  }

  submitPendingAction () {
    return this.dispatch(submitPendingActionCreator());
  }

  submitDoneAction () {
    return this.dispatch(submitDoneActionCreator());
  }


  // accessors
  getNormalizedValue () {
    return this._normalizedValue;
  }

  setNormalizedValue (normalizedValue) {
    this._normalizedValue = normalizedValue;
  }


  // component
  constructor (...args) {
    super(...args);

    this.initState();
    this._unmounted = false;
    this._form$ = this.context._formMediator$;
    this.isForm = !this.props.name;
    this._fieldID = inc++;
    this._fieldName = `${this._form$ ? this._form$.name : ''}${this.props.name ? `${this._form$ ? '->' : ''}${this.props.name}` : ''}`;

    this._selfChild$ = EE();
    this._selfChild$.id = this._fieldID;
    this._selfChild$.name = this._fieldName;

    this._parent$ = EE().connectLifetime(this._selfChild$);

    this._broadcastChange = debounce(this._broadcastChange.bind(this), 100); // TODO: remove debounce
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onControlChange = this.onControlChange.bind(this);
    this.onReset = this.onReset.bind(this);

    this._initGlobalListeners();

    checkName(this.isForm, this.props.name);
  }

  _initGlobalListeners () {
    const { id } = this.props;

    if (!id) {
      return;
    }

    this._selfChild$.onDestroy(submit$.onReceiveMessage(id, () => {
      this.onSubmit();
    }));

    this._selfChild$.onDestroy(change$.onReceiveMessage(id, (name, value) => {
      this._children.getChildrenByName(name).forEach(({ ee }) => {
        ee.sendMessage(EVENT_SET_CHILD_FIELD_VALUE, value);
      });
    }));

    this._selfChild$.onDestroy(initialize$.onReceiveMessage(id, (value) => {
      this._triggerChange(value);
    }));

    this._selfChild$.onDestroy(reset$.onReceiveMessage(id, () => {
      this.onReset();
    }));
  }

  _initChildFieldListeners () {
    this._selfChild$.onReceiveMessage(EVENT_MOUNT_CHILD_FIELD, (fieldID, name, child$) => {
      if (child$.isDestroyed()) {
        return;
      }

      child$ = child$.childEE();

      if (process.env.NODE_ENV !== 'production') {
        const currentFormValue = this.getState().value;

        if (this.props.strictTypes && currentFormValue !== undefined) {
          if (Array.isArray(currentFormValue)) {
            if (!/^\[/.test(name)) {
              throw new Error(`name must be array key first, like "[0].some". "${name}" given`);
            }
          } else if (!isPlainObject(currentFormValue)) {
            throw new Error(`parent value is not a plain Object. you couldn't mount property with name "${name}"`);
          }
        }
      }

      this._children.mount(fieldID, name, child$);

      child$.onReceiveMessage(EVENT_CHILD_WAS_TOUCHED, () => {
        this.onTouched();
      });

      child$.onReceiveMessage(EVENT_CHANGE_CHILD_FIELD_VALUE, (normalizedValue, valid) => {
        this.changeChildFieldMetaAction(name, valid);

        if (isEqual(this.getState().value, normalizedValue)) {
          return;
        }

        Promise.resolve(this.changeValueFieldAction(name, normalizedValue)).then(() => {
          this._triggerChange(this.getState().value);
        });

        this._children.getChildrenByName(name).filter(({ fieldID: id }) => id !== fieldID).forEach(({ ee }) => {
          this._refreshChildFieldValue(ee, name);
        });
      });

      child$.onReceiveMessage(EVENT_CHANGE_NAME_OF_CHILD_FIELD, (fieldID, newName) => {
        this._children.rename(fieldID, newName);
        name = newName;
      });

      this._refreshChildFieldValue(child$, name);
    });

    this._selfChild$.onReceiveMessage(EVENT_UNMOUNT_CHILD_FIELD, (fieldID) => {
      const name = this._children.getNameById(fieldID);

      if (name !== null && this._children.getChildrenByName(name).length <= 1) {
        this.removeChildFieldMetaAction(name);
      }

      this._children.unmount(fieldID);
    });
  }

  _initParentFormListeners () {
    this._parent$.onReceiveMessage(EVENT_SET_CHILD_FIELD_VALUE, (value) => {
      this._setValueEmittedFromParent(value);
    });

    this._parent$.onReceiveMessage(EVENT_FORM_WAS_SUBMITTED, () => {
      this.onFormWasSubmited();
    });
  }

  _setValueEmittedFromParent (normalizedValueFromParent) {
    if (isEqual(normalizedValueFromParent, this.getNormalizedValue())) {
      return;
    }

    const value = this._format(normalizedValueFromParent);

    if (isEqual(value, this.getState().value)) {
      return;
    }

    this._triggerChange(value);

    this._children.getChildren().forEach(({ name, ee }) => {
      this._refreshChildFieldValue(ee, name);
    });
  }

  _refreshChildFieldValue (child$, name) {
    const formattedValue = this._preFormat(this.getState().value);

    child$.sendMessage(EVENT_SET_CHILD_FIELD_VALUE, get(formattedValue, name, undefined));
  }

  _broadcastChange (normalizedValue) {
    const valid = this._isValid();

    if (isEqual(normalizedValue, this._prevNormalizedValue) && valid === this._prevValid) {
      return;
    }

    this._prevValid = valid;
    this._prevNormalizedValue = normalizedValue;

    this._parent$.sendMessage(EVENT_CHANGE_CHILD_FIELD_VALUE, normalizedValue, valid);
  }

  _broadcastMount () {
    this._children = children();

    this._initChildFieldListeners();
    this._initParentFormListeners();

    if (this._form$) {
      this._form$.sendMessage(EVENT_MOUNT_CHILD_FIELD, this._fieldID, this.props.name, this._parent$);
    }
  }

  _broadcastUnmount () {
    if (this._form$) {
      this._form$.sendMessage(EVENT_UNMOUNT_CHILD_FIELD, this._fieldID);
    }
  }

  _checkFormatNormalizeValidity (funcName, result) {
    if (isNaN(result)) {
      logError(`field[${this._fieldName}]: invalid ${funcName} result. NaN was returned`);
    }

    return result;
  }

  _preFormat (value) {
    return this._checkFormatNormalizeValidity('preFormat', this.props.preFormat(value));
  }

  _preNormalize (value) {
    return this._checkFormatNormalizeValidity('preNormalize', this.props.preNormalize(value));
  }

  _format (value) {
    return this._checkFormatNormalizeValidity('format', this.props.format(value));
  }

  _normalize (value) {
    return this._checkFormatNormalizeValidity('normalize', this.props.normalize(value));
  }

  _validate (value) {
    const { validate } = this.props;

    if (this._$validate_ !== validate) {
      this._$validate_ = validate;
      this._$validate = Array.isArray(validate) ? composeValidators(...validate) : validate;
    }

    return this._$validate(value) || '';
  }

  _preValidate (value) {
    const { preValidate } = this.props;

    if (this._$preValidate !== preValidate) {
      this._$preValidate = Array.isArray(preValidate) ? composeValidators(...preValidate) : preValidate;
    }

    return this._$preValidate(value) || '';
  }

  _triggerLocalValidationError (error) {
    error = error == null ? '' : error;

    if (!isString(error)) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('invalid error type. must be string');
      }

      error = this.props.exception;
    }

    if (this.getState().localError === error) {
      return;
    }

    this.changeLocalErrorAction(error);

    if (error) {
      this._broadcastChange(undefined);
    }
  }

  _triggerForeignValidationError (error) {
    error = error == null ? '' : error;

    if (!isString(error)) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('invalid error type. must be string');
      }

      error = this.props.exception;
    }

    if (this.getState().foreignError === error) {
      return false;
    }

    this.changeForeignErrorAction(error);

    return true;
  }

  onTouched () {
    if (this.getState().touched) {
      return;
    }

    this.touchAction();

    this._parent$.sendMessage(EVENT_CHILD_WAS_TOUCHED);
  }

  onChange (value) {
    this.onTouched();

    try {
      value = this._preNormalize(value);
    } catch (err) {
      logWarn(err);
      this._triggerLocalValidationError(this.props.exception);
      return;
    }

    this._triggerChange(value);
  }

  _triggerChange (value) {
    let error = '';

    if (this.props.strictTypes && value != null && this.getState().value != null) {
      const newValType = Object.prototype.toString.call(value);
      const curValType = Object.prototype.toString.call(value);

      if (curValType !== newValType) {
        logError(`invalid value type in ${this.isForm ? 'isolated field' : `field "${this.props.name}`} ". ${curValType} !== ${newValType}`);
      }
    }

    try {
      error = this._preValidate(value);
    } catch (err) {
      logWarn(err);
      error = this.props.exception;
    }

    this._triggerLocalValidationError(error);

    if (error) {
      this.changeValueAction(value);
      this.setNormalizedValue(undefined);
      return;
    }

    const prevNormalizedValue = this.getNormalizedValue();
    let normalizedValue;

    try {
      normalizedValue = this._normalize(value);
    } catch (err) {
      logWarn(err);
      this.changeValueAction(value);
      this.setNormalizedValue(undefined);
      this._triggerLocalValidationError(this.props.exception);
      return;
    }

    this.changeValueAction(value);
    this.setNormalizedValue(normalizedValue);

    const needUpgrade = !isEqual(prevNormalizedValue, normalizedValue);

    if (needUpgrade) {
      this.props.onChange(normalizedValue);
    }

    try {
      error = this._validate(normalizedValue);
    } catch (err) {
      logWarn(err);
      this._triggerForeignValidationError(this.props.exception);

      this._broadcastChange(undefined);
      return;
    }

    this._triggerForeignValidationError(error);

    this._broadcastChange(normalizedValue);
  }

  inlineValidate () {
    let error;
    const normalizedValue = this.getNormalizedValue();

    try {
      error = this._validate(normalizedValue);
    } catch (err) {
      logWarn(err);
      error = this.props.exception;
    }

    const needApplyValue = this._triggerForeignValidationError(error);

    if (needApplyValue) {
      this._broadcastChange(normalizedValue);
    }
  }

  onFormWasSubmited () {
    if (this.getState().submitted) {
      return;
    }

    this.submitAction();

    this._children.getChildren().forEach(({ ee }) => {
      ee.sendMessage(EVENT_FORM_WAS_SUBMITTED);
    });
  }

  onSubmit () {
    const state = this.getState();

    this.onFormWasSubmited();

    if (!this._isValid()) {
      return Promise.reject(new Error('trying submit the from whlie some values are invalid'));
    }

    if (this.props.singleSubmit && state.submitting) {
      return Promise.reject(new Error('trying submit the from while it is submitting yet'));
    }

    this.submitPendingAction();

    return Promise.resolve(this.props.onSubmit(this._normalize(state.value)))
      .catch((err) => {
        this.submitFailedAction(err);

        if (err instanceof Error) {
          logError(err);
        }

        return Promise.reject(err);
      })
      .then((result) => {
        this.submitDoneAction();

        return result;
      });
  }

  onReset () {
    if (this.props.initialValue === undefined) {
      return;
    }

    this._triggerChange(this._format(this.props.initialValue));
  }

  // lifecycle
  componentWillMount () {
    this._broadcastMount();

    this.onReset();
  }

  componentWillUnmount () {
    this._unmounted = true;
    this._broadcastUnmount();

    this._children.destroy();
    this._selfChild$.destroy();
  }

  componentWillReceiveProps ({ name }) {
    if (this.props.name !== name) {
      if (!this.props.name) {
        throw new Error('You shouldn\'t change name if name wasn\'t defined on initialize');
      }

      checkName(this.isForm, name);

      this._parent$.sendMessage(EVENT_CHANGE_NAME_OF_CHILD_FIELD, this._fieldID, name);
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.reinitialize && !isEqual(this.props.initialValue, prevProps.initialValue)) {
      this.onReset();
    }

    this.inlineValidate();
  }

  shouldComponentUpdate ({ pure }) {
    if (pure) {
      const version = this.getState();

      const result = this._prevPureVersion !== version;

      this._prevPureVersion = version;

      return result;
    }

    return true;
  }


  // control specific
  onControlChange (ev) {
    let value;

    if (ev && ev.target && ev.target.type) {
      value = ev.target.type === 'checkbox' ? Boolean(ev.target.checked) : ev.target.value;
    } else {
      value = ev;
    }

    this.onChange(value);
  }

  _isValid () {
    const state = this.getState();

    return !state.localError && !state.foreignError && !state.invalidChildren.length;
  }


  // rendering
  _calcProps () {
    const state = this.getState();
    const value = this._preFormat(state.value);

    const props = {
      control: {
        value,
        onChange: this.onControlChange
      },

      triggerSubmit: this.onSubmit,
      triggerChange: this.onChange,
      triggerReset: this.onReset,

      submitSuccess: state.submitSuccess,
      submitFailed: state.submitFailed,
      submitting: state.submitting,
      submitErrors: state.submitErrors,

      value,
      touched: state.touched,
      submitted: state.submitted,

      valid: this._isValid(),
      error: state.localError || state.foreignError
    };

    if (process.env.NODE_ENV !== 'production') {
      const _children = this._children;

      props.control = { // TODO: remove this deprecation code
        get value () {
          if (_children.hasChildren) {
            logDeprecated('invalid usage of control.value. this element is container and shouldn\'t have the control.value');
          }

          return value;
        },
        set value (val) {
          throw new Error('FractalField ERROR: You shouldn\'t mutate the control.value');
        },
        onChange: (...args) => {
          if (_children.hasChildren) {
            logDeprecated('invalid usage of control.onChange. this element is container and shouldn\'t have the control.onChange');
          }

          this.onControlChange(...args);
        }
      };

      props.$state = {
        state: { ...state },
        props: { ...props }
      };
    }

    return props;
  }

  render () {
    const { children } = this.props;

    const state = this.getState();

    if (state.version !== this._prevVersion) {
      this._prevVersion = state.version;
      this._renderingProps = this._calcProps();

      //console.log('|', this._fieldName, `VERSION: ${state.version}`, ', VALUE:', state.value, `, ERROR: '${this._renderingProps.error}'`);
    }

    return isFunction(children) ? children(this._renderingProps) : children;
  }
}
