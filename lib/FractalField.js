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
  changeForeignErrorActionCreator
} from './FractalField.store';
import children from './children';



export const EVENT = {
  MOUNT_CHILD_FIELD: 'MOUNT_CHILD_FIELD',
  CHANGE_NAME_OF_CHILD_FIELD: 'CHANGE_NAME_OF_CHILD_FIELD',
  FORM_WAS_SUBMITTED: 'FORM_WAS_SUBMITTED',
  CHILD_WAS_TOUCHED: 'CHILD_WAS_TOUCHED',
  UNMOUNT_CHILD_FIELD: 'UNMOUNT_CHILD_FIELD',
  SET_CHILD_FIELD_VALUE: 'SET_CHILD_FIELD_VALUE',
  CHANGE_CHILD_FIELD_VALUE: 'CHANGE_CHILD_FIELD_VALUE'
};



let counter = 0;



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

const logError = (...args) => error$.emit(...args);




export default class FractalField extends Component {
  getChildContext () {
    return {
      _formMediator$: this._selfChild$,
      _formState: () => this.getState()
    };
  }

  static childContextTypes = {
    _formMediator$: PropTypes.object,
    _formState: PropTypes.func
  };

  static contextTypes = {
    _formMediator$: PropTypes.object,
    _formState: PropTypes.func
  };

  static propTypes = {
    id: PropTypes.string,
    instantUpdate: PropTypes.bool,
    isolated: PropTypes.oneOfType([ PropTypes.bool, PropTypes.string ]),
    name: PropTypes.string,
    children: PropTypes.oneOfType([ PropTypes.node, PropTypes.func ]).isRequired,
    strictTypes: PropTypes.bool,
    initialValue: PropTypes.any,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    exceptionMessage: PropTypes.string,
    normalize: PropTypes.func,
    format: PropTypes.func,
    validate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]),
    preFormat: PropTypes.func,
    preNormalize: PropTypes.func,
    preValidate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ])
  };

  static defaultProps = {
    id: null,
    isolated: null,
    name: null,
    strictTypes: true,
    instantUpdate: false,
    onSubmit: () => {},
    onChange: () => {},
    format: (value) => value,
    validate: (value) => undefined,
    normalize: (value) => value,
    exceptionMessage: 'Invalid value',
    preFormat: (value) => value,
    preValidate: (value) => undefined,
    preNormalize: (value) => value
  };

  // state management
  initState () {
    this._state = this.state = reducer(undefined, {});
  }

  getState () {
    return this._state;
  }

  dispatch (action) {
    this._state = reducer(this._state, action);

    if (!this._$setState) {
      this._$setState = debounce(() => this.setState(() => this._state), 0); // eslint-disable-line react/no-set-state
    }

    this._$setState();

    return this._state;
  }

  changeValueAction (value, normalizedValue) {
    return this.dispatch(changeValueActionCreator(value, normalizedValue));
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

  changeChildFieldMetaAction (name, state) {
    return this.dispatch(changeChildFieldMetaActionCreator(name, state));
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

  // component
  constructor (...args) {
    super(...args);

    this.initState();
    this._form$ = this.context._formMediator$;
    this.isForm = Boolean(this.props.isolated);
    this._fieldID = counter++;
    this._fieldName = `${this._form$ ? this._form$.name : ''}${this.props.name ? `${this._form$ ? '->' : ''}${this.props.name}` : ''}`;

    this._selfChild$ = EE();
    this._selfChild$.id = this._fieldID;
    this._selfChild$.name = this._fieldName;

    this._parent$ = EE().connectLifetime(this._selfChild$);

    this._initGlobalListeners();
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
        ee.sendMessage(EVENT.SET_CHILD_FIELD_VALUE, value);
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
    this._selfChild$.onReceiveMessage(EVENT.MOUNT_CHILD_FIELD, (fieldID, name, child$) => {
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

      child$.onReceiveMessage(EVENT.CHILD_WAS_TOUCHED, () => {
        this.onTouched();
      });

      child$.onReceiveMessage(EVENT.CHANGE_CHILD_FIELD_VALUE, (normalizedValue, fieldState) => {
        this.changeChildFieldMetaAction(name, fieldState);

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

      child$.onReceiveMessage(EVENT.CHANGE_NAME_OF_CHILD_FIELD, (fieldID, newName) => {
        this._children.rename(fieldID, newName);
        name = newName;
      });

      this._refreshChildFieldValue(child$, name);
    });

    this._selfChild$.onReceiveMessage(EVENT.UNMOUNT_CHILD_FIELD, (fieldID) => {
      this._children.unmount(fieldID);
    });
  }

  _initParentFormListeners () {
    const fromParent$ = this._parent$;

    fromParent$.onReceiveMessage(EVENT.SET_CHILD_FIELD_VALUE, (value) => {
      this._setValueEmittedFromParent(value);
    });

    fromParent$.onReceiveMessage(EVENT.FORM_WAS_SUBMITTED, () => {
      this.onFormWasSubmited();
    });
  }

  _setValueEmittedFromParent (value) {
    const formattedValue = this._format(value);

    if (isEqual(formattedValue, this.getState().value)) {
      return;
    }

    this._triggerChange(formattedValue);

    this._children.getChildren().forEach(({ name, ee }) => {
      this._refreshChildFieldValue(ee, name);
    });
  }

  _refreshChildFieldValue (child$, name) {
    const formattedValue = this._preFormat(this.getState().value);

    child$.sendMessage(EVENT.SET_CHILD_FIELD_VALUE, get(formattedValue, name, undefined));
  }

  _broadcastChange (value, delay = this.props.instantUpdate ? 0 : 150) {
    if (!delay) {
      this._parent$.sendMessage(EVENT.CHANGE_CHILD_FIELD_VALUE, value, this.getState());
      return;
    }

    if (!this._$notifyParentAboutValueChanging) {
      this._$notifyParentAboutValueChanging = debounce((value) => {
        this._parent$.sendMessage(EVENT.CHANGE_CHILD_FIELD_VALUE, value, this.getState());
      }, delay); // TODO: find correct debounce time
    }

    this._$notifyParentAboutValueChanging(value);
  }

  _broadcastMount () {
    this._children = children();

    this._initChildFieldListeners();
    this._initParentFormListeners();

    if (this._form$) {
      this._form$.sendMessage(EVENT.MOUNT_CHILD_FIELD, this._fieldID, this._getName(), this._parent$);
    }
  }

  _broadcastUnmount () {
    if (this._form$) {
      this._form$.sendMessage(EVENT.UNMOUNT_CHILD_FIELD, this._fieldID);
    }
  }

  _getName () {
    const { name } = this.props;

    if (this._$name_ !== name) {
      this._$name_ = name;

      if (this.isForm) {
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

      this._$name = name;
    }

    return this._$name;
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

  _triggerLocalValidationError (error = '') {
    if (!isString(error)) {
      throw new Error('invalid error type. must be string');
    }

    if (this.getState().localError === error) {
      return;
    }

    this.changeLocalErrorAction(error);

    if (error) {
      this._broadcastChange(undefined);
    }
  }

  _triggerForeignValidationError (error = '', broadcast = false) {
    if (!isString(error)) {
      throw new Error('invalid error type. must be string');
    }

    if (this.getState().foreignError === error) {
      return;
    }

    this.changeForeignErrorAction(error);

    if (error && broadcast) {
      this._broadcastChange(undefined);
    }
  }

  onTouched () {
    if (this.getState().touched) {
      return;
    }

    this.touchAction();

    this._parent$.sendMessage(EVENT.CHILD_WAS_TOUCHED);
  }

  onChange (value) {
    this.onTouched();

    try {
      value = this._preNormalize(value);
    } catch (err) {
      logError(err);
      this._triggerLocalValidationError(this.props.exceptionMessage);
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
      logError(err);
      error = this.props.exceptionMessage;
    }

    this._triggerLocalValidationError(error);

    if (error) {
      this.changeValueAction(value, undefined);
      return;
    }

    const prevNormalizedValue = this.getState().normalizedValue;
    let normalizedValue;

    try {
      normalizedValue = this._normalize(value);
    } catch (err) {
      logError(err);
      this.changeValueAction(value, undefined);
      this._triggerLocalValidationError(this.props.exceptionMessage);
      return;
    }

    this.changeValueAction(value, normalizedValue);

    const needUpgrade = !isEqual(prevNormalizedValue, normalizedValue);

    if (needUpgrade) {
      this.props.onChange(normalizedValue);
    }

    try {
      error = this._validate(normalizedValue);
    } catch (err) {
      logError(err);
      this._triggerForeignValidationError(this.props.exceptionMessage, true);
      return;
    }

    this._triggerForeignValidationError(error, false);

    this._broadcastChange(normalizedValue);
  }

  inlineValidate () {
    let error;
    const normalizedValue = this.getState().normalizedValue;

    try {
      error = this._validate(normalizedValue);
    } catch (err) {
      logError(err);
      this._triggerForeignValidationError(this.props.exceptionMessage, true);
      return;
    }

    if (error !== this.getState().foreignError) {
      this._triggerForeignValidationError(error, false);

      this._broadcastChange(normalizedValue);
    }
  }

  onFormWasSubmited () {
    if (this.getState().submitted) {
      return;
    }

    this.submitAction();

    this._children.getChildren().forEach(({ ee }) => {
      ee.sendMessage(EVENT.FORM_WAS_SUBMITTED);
    });
  }

  onSubmit () {
    const state = this.getState();

    this.onFormWasSubmited();

    if (state.localError || state.foreignError || !state.validChildren) {
      return;
    }

    this.submitPendingAction();

    Promise.resolve(this.props.onSubmit(this._normalize(state.value)))
      .catch((err) => {
        this.submitFailedAction(err);

        if (err instanceof Error) {
          logError(err);
        }

        return Promise.reject(err);
      })
      .then(() => {
        this.submitDoneAction();
      });
  }

  onReset () {
    if (!this.isForm) {
      if (process.env.NODE_ENV !== 'production') {
        if (this.props.initialValue !== undefined) {
          throw new Error('initialValue for non-isolated component must be undefined');
        }
      }

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
    this._broadcastUnmount();

    this._children.destroy();
    this._selfChild$.destroy();
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.name !== nextProps.name) {
      this._parent$.sendMessage(EVENT.CHANGE_NAME_OF_CHILD_FIELD, this._fieldID, nextProps.name);
    }
  }

  componentDidUpdate () {
    this.inlineValidate();
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

  // rendering
  render () {
    const { children } = this.props;

    if (!this._$initedRenderProps) { // init
      this._$initedRenderProps = true;

      this._$triggerChange = this.onChange.bind(this);
      this._$triggerSubmit = this.onSubmit.bind(this);
      this._$onControlChange = this.onControlChange.bind(this);
      this._$triggerReset = this.onReset.bind(this);
    }

    const state = this.getState();
    const name = this._getName();
    const value = this._preFormat(state.value);

    const props = {
      control: {
        value,
        onChange: this._$onControlChange
      },

      triggerSubmit: this._$triggerSubmit,
      triggerChange: this._$triggerChange,
      triggerReset: this._$triggerReset,

      submitSuccess: state.submitSuccess,
      submitFailed: state.submitFailed,
      submitting: state.submitting,
      submitErrors: state.submitErrors,

      name,
      value,
      touched: state.touched,
      submitted: state.submitted,
      localError: state.localError,
      foreignError: state.foreignError,

      valid: !state.localError && !state.foreignError && state.validChildren,
      error: state.localError || state.foreignError || ''
    };

    if (process.env.NODE_ENV !== 'production') {
      props.$state = state;
    }

    return isFunction(children) ? children(props) : children;
  }
}
