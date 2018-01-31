import PropTypes from 'prop-types';
import React, { Component } from 'react';
import isNumber from 'lodash/isNumber';
import isFunction from 'lodash/isFunction';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import isUndefined from 'lodash/isUndefined';
import composeValidators from '../utils/compose-validators';
import assertAddRemoveProp from '../assert/assertAddRemoveProp';
import assertChangeProp from '../assert/assertChangeProp';
import assertType from '../assert/assertType';
import getValueType from '../utils/getValueType';
import { consoleLog, consoleTime, consoleTimeEnd } from '../utils/log';
import Mediator from '../mediator/Mediator';
import { change, reset, initialize, submit } from '../utils/global';
import PrimitiveEE from '../utils/PrimitiveEE';
//import KeyComponent from './KeyComponent';



let counter = 0;
const salt = Date.now().toString(36);


const mkID = (name, isForm, shareType) => `f${salt}${++counter}@${shareType}__${name == null ? '' : (isNumber(name) ? `[${name}]` : name)}${isForm ? '#' : '@'}`;


export default class FieldComponent extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),

    isolated: PropTypes.bool,

    // value binding
    name: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    initialValue: PropTypes.any,
    value: PropTypes.any,
    onChange: PropTypes.func,
    onValueChange: PropTypes.func,

    // validate
    validate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]), // TODO: remove possibility to specify validators array
    onChangeValidity: PropTypes.func,
    postponeInvalid: PropTypes.bool,

    // form
    form: PropTypes.bool,
    onSubmit: PropTypes.func,

    exceptionMessage: PropTypes.any,

    children: PropTypes.func.isRequired,

    autoClean: PropTypes.bool,

    debug: PropTypes.bool

    // meta binding // TODO: implement meta store
    //meta: PropTypes.object,
    //onChangeMeta: PropTypes.func,
  };

  static defaultProps = {
    autoClean: false,
    isolated: false,
    name: null,
    exceptionMessage: 'Invalid Value',
    validate: null,
    initialValue: undefined,
    debug: false,
    form: false,
    onSubmit: null,
    onChange: null
  };


  // context
  static childContextTypes = {
    _fractalFieldMediator: PropTypes.object
  };

  static contextTypes = {
    _fractalFieldMediator: PropTypes.object
  };

  getChildContext () {
    return {
      _fractalFieldMediator: this.mediator
    };
  }



  getValueType () {
    //throw new Error('getValueType must be overraded!');
    return null; // detect automatic
  }

  getInitialParams () {
    return {
      type: this.getValueType(),
      name: this.props.name,
      shareMeta: this.shareMeta,
      shareValue: this.shareValue,
      value: this.getInitialValue(),
      autoClean: Boolean(this.props.autoClean)
    };
  }

  getInitialValue () {
    let value = this.hasExternalValueStorage ? (this.props.value === undefined ? this.props.initialValue : this.props.value) : this.props.initialValue;

    if (this.hasParentForm && this.props.name !== null) {
      const tmpVal = this.context._fractalFieldMediator.getState().value;

      value = tmpVal && tmpVal[this.props.name] !== undefined ? tmpVal[this.props.name] : value;
    }

    return value;
  }



  getValue () {
    if (this._postponedValueMediatorValueVersion !== null) {
      return this._postponedValue;
    }

    //if (this.hasExternalValueStorage) {
    //  return this.props.value;
    //}

    return this.getState().value;
  }

  getMeta () {
    return this.getState().meta;
  }

  getClothesIsolatedMediatorMeta () {
    return this.mediator.getClothesIsolatedMediator().getState().meta;
  }

  constructor (...args) {
    super(...args);

    this._destroy$ = PrimitiveEE();

    this.debug = (this.context._fractalFieldMediator && this.context._fractalFieldMediator._debug) || this.props.debug;

    this.state = {
      form: {},
      postponedValue: undefined
    };

    this.hasExternalValueStorage = this.props.hasOwnProperty('value');
    this.hasExternalMetaStorage = this.props.hasOwnProperty('meta');

    this.hasParentForm = Boolean(this.context._fractalFieldMediator);

    this.isForm = !this.hasParentForm || this.props.form;

    this.shareMeta = true;
    this.shareValue = true;

    if ((this.hasExternalValueStorage && this.hasExternalMetaStorage) || !this.hasParentForm || this.props.isolated) {
      this.shareMeta = false;
      this.shareValue = false;
    } else if (this.hasExternalValueStorage || this.props.name === null || this.isForm) {
      this.shareMeta = true;
      this.shareValue = false;
    } else if (this.hasExternalMetaStorage) {
      this.shareMeta = false;
      this.shareValue = true;
    }

    if ((this.isForm && this.name) || (!this.shareValue && this.name)) {
      throw new Error('[FractalField] name must not be specified when field has no value sharing');
    }

    this.componentID = this.props.id || mkID(this.props.name, this.isForm, this.share);

    this.mediator = new Mediator(this.componentID, !this.shareMeta && !this.shareValue ? null : this.context._fractalFieldMediator, { debug: this.debug });

    this.onDestroy(() => {
      this.mediator.destroy();
    });

    this.flushInitializeTransaction = this.mediator.transaction('init');

    this.mediator.mount(this.getInitialParams());

    // system
    this._prevCalcParamsMediatorVersion = null;
    this._prevCalcParams = null;
    this._prevNotifyChangeValue = undefined;
    this._prevNotifyValueChangeValue = this.getValue();
    this._prevRenderMediatorVersion = 0;
    this._prevValidateValue = -1;
    this._prevValidate = null;
    this._prevRefreshIfChangedMediatorVersion = null;
    this._prevNotifyOnChangeValidity = true;

    this._prevPostponedValue = undefined;
    this._postponedValue = undefined;
    this._postponedValueMediatorValueVersion = null;

    this.render = this.render.bind(this);
    this.triggerReset = this.triggerReset.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
    this.triggerSubmit = this.triggerSubmit.bind(this);
    this.renderChildren = this.renderChildren.bind(this);
  }

  onDestroy (listener) {
    return this._destroy$.on(listener);
  }

  getState () {
    return this.mediator.getState();
  }

  notifyOnChange (value) {
    if (!this.props.onChange || this._prevNotifyChangeValue === value) {
      return;
    }

    this._prevNotifyChangeValue = value;

    this.props.onChange(value);
  }

  notifyValueOnChange (value) {
    if (!this.props.onValueChange || this._prevNotifyValueChangeValue === value) {
      return;
    }

    this._prevNotifyValueChangeValue = value;

    this.props.onValueChange(value);
  }

  notifyOnChangeValidity (valid) {
    if (this.props.onChangeValidity && this._prevNotifyOnChangeValidity !== valid) {
      this.props.onChangeValidity(valid);
    }

    this._prevNotifyOnChangeValidity = valid;
  }

  _updateComponentState (values) {
    this.setState((prevState) => ({ ...prevState, ...values })); // eslint-disable-line react/no-set-state
  }

  triggerChange (normalizedValue, { touch = true, notify = true } = {}) {
    if (this.props.postponeInvalid) {
      const isValid = this.validate(normalizedValue) && !this.getMeta().hasException;

      if (!isValid) {
        this._postponedValueMediatorValueVersion = this.getState().valueVersion;
        this._postponedValue = normalizedValue;
        this._updateComponentState({
          postponedValue: this._postponedValue
        });
        return;
      }
    }

    this._postponedValueMediatorValueVersion = null;

    this.mediator.changeValue(normalizedValue, { touch });

    normalizedValue = this.getValue();

    if (notify) {
      this.notifyOnChange(normalizedValue);
    }
  }

  triggerReset (initialValue = this.getInitialValue()) {
    this.mediator.reset(initialValue);
  }

  triggerSubmit (ev) {
    if (ev) {
      ev.preventDefault();
    }

    const flush = this.mediator.transaction('triggerSubmit');

    this.mediator.submitStart();

    if (!this.getMeta().valid) {
      this.mediator.submit();
      flush();
      return Promise.reject(null); // eslint-disable-line prefer-promise-reject-errors
    }

    if (!this.props.onSubmit) {
      this.mediator.submitDone();
      flush();
      return Promise.reject(null); // eslint-disable-line prefer-promise-reject-errors
    }

    const value = this.getValue();

    flush();

    return new Promise(() => {
      return Promise.resolve(this.props.onSubmit(value));
    }).then(
      () => {
        this.mediator.submitDone();
      },
      (err) => {
        this.mediator.submitFailed(err);

        return Promise.reject(err);
      }
    );
  }

  validate (value) {
    const { validate } = this.props;
    const flush = this.mediator.transaction('validate');

    const validateIsArray = Array.isArray(validate);

    if (!validate || (validateIsArray && !validate.length)) {
      this.mediator.changeValidity(null);
      flush();
      return true;
    }

    if (this._prevValidate === validate && value === this._prevValidateValue) {
      flush();

      return !this.getMeta().error;
    }

    let error = null;
    const _validate = validateIsArray ? composeValidators(...validate) : validate;

    try {
      error = _validate(value);
      this._prevValidate = validate;
      this._prevValidateValue = value;
    } catch (err) {
      this.mediator.sysValidateError(err);
      flush();
      return false;
    }

    this.mediator.sysValidateError(null);
    this.mediator.changeValidity(error);

    flush();

    return !error;
  }

  calcParams () {
    const state = this.getState();

    const meta = this.getMeta();

    const formFieldMeta = this.getClothesIsolatedMediatorMeta();

    let params = {
      triggerChange: this.triggerChange,
      triggerReset: this.triggerReset,

      valid: meta.valid,
      invalid: !meta.valid,
      hasException: meta.hasException,
      error: meta.hasException ? this.props.exceptionMessage : meta.error,
      invalidChildren: this.mediator.dehydrateNames(meta.errorsIn).filter(Boolean),

      value: this.getValue(),

      pristine: !meta.touched,
      touched: meta.touched,

      active: meta.active,
      activated: meta.activated,

      form: {
        valid: formFieldMeta.valid,
        invalid: !formFieldMeta.valid,
        hasException: formFieldMeta.hasException,

        active: formFieldMeta.active,
        activated: formFieldMeta.activated,

        touched: formFieldMeta.touched,
        pristine: !formFieldMeta.touched,

        submitted: formFieldMeta.submitted,
        submittedTimes: formFieldMeta.submittedTimes,
        submitFailed: formFieldMeta.submitFailed,
        submitSuccess: formFieldMeta.submitSuccess,
        submitting: formFieldMeta.submitting
      }
    };

    if (this.isForm) {
      params = {
        ...params,
        triggerSubmit: this.triggerSubmit,
        submitted: meta.submitted,
        submittedTimes: meta.submittedTimes,
        submitFailed: meta.submitFailed,
        submitSuccess: meta.submitSuccess,
        submitting: meta.submitting
      };
    }

    if (this.debug) {
      params.$field = state;
      params.$state = this.mediator._store._state;
    }

    return params;
  }

  _calcParams () {
    if (
      this._prevCalcParamsMediatorVersion === this.mediator.version()
      && (
        this._postponedValueMediatorValueVersion === null
        || (this._prevPostponedValue === this._postponedValue)
      )
    ) {
      return this._prevCalcParams;
    }

    this._prevCalcParamsMediatorVersion = this.mediator.version();

    const params = this.calcParams();

    this._prevCalcParams = params;

    return params;
  }

  renderChildren () {
    const { children } = this.props;

    this._prevRenderMediatorVersion = this.mediator.version();

    return isFunction(children) ? children(this._calcParams()) : children;
  }

  renderInner () {
    return this.renderChildren();
  }

  render () {
    return this.renderInner();
  }

  subscribeGlobalStreams () {
    this.onDestroy(change.subscribe(this.componentID, (componentID, value, params) => this.triggerChange(value, params)));

    this.onDestroy(reset.subscribe(this.componentID, (initialValue) => this.triggerReset(initialValue)));

    this.onDestroy(initialize.subscribe(this.componentID, () => {
      // TODO: trigger initialize
    }));

    this.onDestroy(submit.subscribe(this.componentID, () => this.triggerSubmit()));
  }

  _refreshIfChanged () {
    const currentVersion = this.mediator.version();

    if (this.shareMeta || this.shareValue || this._prevRefreshIfChangedMediatorVersion === currentVersion) {
      return;
    }

    this._prevRefreshIfChangedMediatorVersion = currentVersion;

    if (this.debug) {
      consoleLog(`TRIGGER SET STATE ${this.componentID}`);
      consoleTime(`RERENDERED ${this.componentID}`);
    }

    this._updateComponentState({
      form: this.mediator.getFullState()
    });
  }

  _unwatchMediatorChange () {}

  _watchMediatorChange () {
    this._unwatchMediatorChange();

    this._unwatchMediatorChange = this.mediator.onceChange(() => {
      this._refreshIfChanged();
    });
  }

  componentWillMount () {
  }

  componentDidMount () {
    //console.log('INIT', this.componentID);
    this.mediator.init();
    this.validate(this.getValue());
    this.flushInitializeTransaction();
    this.subscribeGlobalStreams();
    this._refreshIfChanged();
    this._watchMediatorChange();
  }

  componentWillUnmount () {
    this._destroy$.emit();
    this._destroy$.destroy();
  }

  componentDidUpdate (prevProps, prevState) {
    this._unwatchMediatorChange();

    if (this.debug && (!this.shareValue && !this.shareMeta)) {
      consoleTimeEnd(`RERENDERED ${this.componentID}`);
    }

    const flush = this.mediator.transaction('componentDidUpdate');

    const valueVersion = this.getState().valueVersion;

    if (this._postponedValueMediatorValueVersion !== valueVersion) {
      this._postponedValueMediatorValueVersion = null;
    }

    if (this.hasExternalValueStorage && !isEqual(this.props.value, prevProps.value)) {
      if (this._postponedValueMediatorValueVersion !== null) {
        this._postponedValueMediatorValueVersion = null;
      }

      this.triggerChange(this.props.value, { touch: false, notify: false });
    }

    this.onUpdate(prevProps, prevState);

    const meta = this.getMeta();

    this.notifyOnChangeValidity(meta.valid);

    flush();

    this._refreshIfChanged();

    this._watchMediatorChange();
  }

  onUpdate (prevProps) {
    const val = this.getValue();

    if (process.env.NODE_ENV !== 'production') {
      assertChangeProp(this.props, prevProps, 'id');
      assertChangeProp(this.props, prevProps, 'form');
      assertChangeProp(this.props, prevProps, 'debug');
      assertChangeProp(this.props, prevProps, 'autoClean');
      assertChangeProp(this.props, prevProps, 'isolated');
      assertAddRemoveProp(this.props, prevProps, 'value');
      assertAddRemoveProp(this.props, prevProps, 'name');
      assertAddRemoveProp(this.props, prevProps, 'debug');
      assertAddRemoveProp(this.props, prevProps, 'onChange');
      assertAddRemoveProp(this.props, prevProps, 'onChangeMeta');
      assertAddRemoveProp(this.props, prevProps, 'meta');
      assertAddRemoveProp(this.props, prevProps, 'form');
      assertAddRemoveProp(this.props, prevProps, 'id');
      assertAddRemoveProp(this.props, prevProps, 'autoClean');
      assertAddRemoveProp(this.props, prevProps, 'isolated');

      if (!isNil(val)) {
        if (isNil(this._valueType)) {
          this._valueType = this.getValueType() || getValueType(val);
        }

        assertType(`value of field "${this.componentID}" or null/undefined`, this._valueType, val);
      }

      if (isUndefined(val)) {
        throw new TypeError(`[FractalField] value of Field "${this.componentID}" must not be undefined`);
      }
    }

    if (this.props.name !== prevProps.name) {
      this.mediator.rename(this.props.name);
    }

    this.notifyValueOnChange(this.getValue());

    this.validate(val);
  }
}
