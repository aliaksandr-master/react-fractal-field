import PropTypes from 'prop-types';
import React, { Component } from 'react';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';
import composeValidators from '../utils/compose-validators';
import assertAddRemoveProp from '../assert/assertAddRemoveProp';
import assertChangeProp from '../assert/assertChangeProp';
import assertType from '../assert/assertType';
import { SHARE } from '../utils/const';
import { consoleLog, consoleTime, consoleTimeEnd } from '../utils/log';
import Mediator from '../mediator/Mediator';
import { change, reset, initialize, submit } from '../utils/global';
import PrimitiveEE from '../utils/PrimitiveEE';
//import KeyComponent from './KeyComponent';



let counter = 0;
const salt = Date.now();

export default class FieldComponent extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    name: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    form: PropTypes.bool,
    autoClean: PropTypes.bool,

    postponeInvalid: PropTypes.bool,

    value: PropTypes.any,
    onChange: PropTypes.func,
    onValueChange: PropTypes.func,

    onChangeValidity: PropTypes.func,

    //meta: PropTypes.object, // TODO: implement meta store
    //onChangeMeta: PropTypes.func, // TODO: implement meta store

    validate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]),

    initialValue: PropTypes.any,

    onSubmit: PropTypes.func,

    exceptionMessage: PropTypes.any,

    share: PropTypes.oneOf(Object.values(SHARE)),
    debug: PropTypes.bool,

    children: PropTypes.func.isRequired
  };

  static defaultProps = {
    autoClean: false,
    name: null,
    exceptionMessage: 'Invalid Value',
    validate: null,
    share: null,
    initialValue: undefined,
    debug: false,
    form: false,
    onSubmit: null,
    onChange: null
  };

  static childContextTypes = {
    _fractalFieldMediator: PropTypes.object
  };

  static contextTypes = {
    _fractalFieldMediator: PropTypes.object
  };

  getValue () {
    if (this._valueIsPostponed) {
      return this._postponedValue;
    }

    if (this.provideValueStorage) {
      return this.props.value;
    }

    return this.getState().value;
  }

  getMeta () {
    return this.getState().meta;
  }

  getClothesIsolatedMediatorMeta () {
    return this.mediator.getClothesIsolatedMediator().getState().meta;
  }

  getValueType () {
    throw new Error('getType must be overraded!');
  }

  getChildContext () {
    return {
      _fractalFieldMediator: this.mediator
    };
  }

  getInitialParams () {
    return {
      type: this.valueType,
      name: this.props.name,
      share: this.share,
      value: this.getInitialValue(),
      autoClean: Boolean(this.props.autoClean)
    };
  }

  getInitialValue () {
    let value = this.provideValueStorage ? (this.props.value === undefined ? this.props.initialValue : this.props.value) : this.props.initialValue;

    if (this.hasParentForm && this.props.name !== null) {
      const tmpVal = this.context._fractalFieldMediator.getState().value;

      value = tmpVal && tmpVal[this.props.name] !== undefined ? tmpVal[this.props.name] : value;
    }

    return value;
  }

  constructor (...args) {
    super(...args);

    this.state = {
      form: {},
      postponedValue: undefined
    };

    this.valueType = this.getValueType();

    this.provideValueStorage = this.props.hasOwnProperty('value') && this.props.hasOwnProperty('onChange');
    this.provideMetaStorage = this.props.hasOwnProperty('meta') && this.props.hasOwnProperty('onChangeMeta');

    this.componentID = this.props.id || `fractal-field-${salt}-${++counter}-${this.props.name == null ? (this.hasParentForm ? '@' : '#') : this.props.name}`;

    this.hasParentForm = Boolean(this.context._fractalFieldMediator);

    this.isForm = !this.hasParentForm || this.props.form;

    if (this.provideValueStorage && this.provideMetaStorage || !this.hasParentForm) {
      this.share = SHARE.NONE;
    } else if (this.provideValueStorage || this.props.name === null) {
      this.share = SHARE.META;
    } else if (this.provideMetaStorage) {
      this.share = SHARE.VALUE;
    } else if (this.props.share) {
      this.share = this.props.share;
    } else {
      this.share = SHARE.ALL;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (this.props.share && this.props.share !== this.share) {
        throw new Error(`invalid sharing type "${this.props.share}" specified in props [it will be ignored in production mode]. you should not manually define the share prop in this case`);
      }
    }

    this.debug = this.context._fractalFieldMediator ? this.context._fractalFieldMediator._debug : this.props.debug;

    this.mediator = new Mediator(this.componentID, this.share === SHARE.NONE ? null : this.context._fractalFieldMediator, { debug: this.debug });

    this.flushInitializeTransaction = this.mediator.transaction('init');

    this.mediator.mount(this.getInitialParams());

    this._paramsVersion = null;
    this._prevParams = null;

    this._notifiedChangeValue = undefined;

    this._renderedVersion = 0;

    this._initialValueVersionVersion = 0;

    this._prevValidatedValue = -1;
    this._prevValidate = null;

    this._postponedValue = undefined;
    this._prevPostponedValue = undefined;
    this._valueIsPostponed = false;

    this.render = this.render.bind(this);
    this.triggerReset = this.triggerReset.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
    this.triggerSubmit = this.triggerSubmit.bind(this);
    this.renderChildren = this.renderChildren.bind(this);

    this._destroy$ = PrimitiveEE();
  }

  onDestroy (listener) {
    return this._destroy$.on(listener);
  }

  getState () {
    return this.mediator.getState();
  }

  notifyOnChange (value) {
    if (!this.props.onChange || this._notifiedChangeValue === value) {
      return;
    }

    this._notifiedChangeValue = value;

    this.props.onChange(value);
  }

  _notifyValueOnChange (value) {
    if (!this.props.onValueChange || this._notifiedValueChangeValue === value) {
      return;
    }

    this._notifiedValueChangeValue = value;

    this.props.onValueChange(value);
  }

  _updateComponentState (values) {
    this.setState((prevState) => ({ ...prevState, ...values })); // eslint-disable-line react/no-set-state
  }

  triggerChange (normalizedValue) {
    if (this.props.postponeInvalid) {
      const isValid = this.validate(normalizedValue) && !this.getMeta().hasException;

      this._valueIsPostponed = !isValid;

      if (this._valueIsPostponed) {
        this._postponedValue = normalizedValue;
        this._updateComponentState({
          postponedValue: this._postponedValue
        });
        return;
      }
    }

    if (!this.provideValueStorage) {
      this.mediator.changeValue(normalizedValue);

      normalizedValue = this.getValue();
    }

    this.notifyOnChange(normalizedValue);
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

    if (this._prevValidate === validate && value === this._prevValidatedValue) {
      flush();

      return !this.getMeta().error;
    }

    let error = null;
    const _validate = validateIsArray ? composeValidators(...validate) : validate;

    try {
      error = _validate(value);
      this._prevValidate = validate;
      this._prevValidatedValue = value;
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
    if (this._valueIsPostponed) {
      if (this._prevPostponedValue === this._postponedValue) {
        return this._prevParams;
      }

      this._prevPostponedValue = this._postponedValue;
    } else if (this._paramsVersion === this.mediator.version()) {
      return this._prevParams;
    }

    this._paramsVersion = this.mediator.version();

    const params = this.calcParams();

    this._prevParams = params;

    return params;
  }

  renderChildren () {
    const { children } = this.props;

    this._renderedVersion = this.mediator.version();

    return isFunction(children) ? children(this._calcParams()) : children;
  }

  renderInner () {
    return this.renderChildren();
  }

  render () {
    return this.renderInner();
  }

  subscribeGlobalStreams () {
    this.onDestroy(change.subscribe(this.componentID, (componentID, value) => this.triggerChange(value)));

    this.onDestroy(reset.subscribe(this.componentID, (initialValue) => this.triggerReset(initialValue)));

    this.onDestroy(initialize.subscribe(this.componentID, () => {
      // TODO: trigger initialize
    }));

    this.onDestroy(submit.subscribe(this.componentID, () => this.triggerSubmit()));
  }

  _refreshIfChanged () {
    const currentVersion = this.mediator.version();

    if (this.share !== SHARE.NONE || this._prevVersion === currentVersion) {
      return;
    }

    this._prevVersion = currentVersion;

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
    this.mediator.destroy();
  }

  componentDidUpdate (prevProps, prevState) {
    this._unwatchMediatorChange();

    if (this.debug && this.share === SHARE.NONE) {
      consoleTimeEnd(`RERENDERED ${this.componentID}`);
    }

    const flush = this.mediator.transaction('componentDidUpdate');

    const valueVersion = this.getState().valueVersion;

    if (this._valueIsPostponed && this._prevValueVersion !== valueVersion) {
      this._prevValueVersion = valueVersion;
      this._valueIsPostponed = false;
    }

    this.onUpdate(prevProps, prevState);

    const meta = this.getMeta();

    if (this.props.onChangeValidity && this._prevValidity !== meta.valid) {
      this.props.onChangeValidity(meta.valid);
    }

    this._prevValidity = meta.valid;

    flush();

    this._refreshIfChanged();

    this._watchMediatorChange();
  }

  onUpdate (prevProps) {
    const val = this.getValue();

    if (process.env.NODE_ENV !== 'production') {
      assertChangeProp(this.props, prevProps, 'id');
      assertChangeProp(this.props, prevProps, 'share');
      assertChangeProp(this.props, prevProps, 'form');
      assertChangeProp(this.props, prevProps, 'debug');
      assertChangeProp(this.props, prevProps, 'autoClean');
      assertAddRemoveProp(this.props, prevProps, 'value');
      assertAddRemoveProp(this.props, prevProps, 'name');
      assertAddRemoveProp(this.props, prevProps, 'debug');
      assertAddRemoveProp(this.props, prevProps, 'onChange');
      assertAddRemoveProp(this.props, prevProps, 'onChangeMeta');
      assertAddRemoveProp(this.props, prevProps, 'meta');
      assertAddRemoveProp(this.props, prevProps, 'form');
      assertAddRemoveProp(this.props, prevProps, 'share');
      assertAddRemoveProp(this.props, prevProps, 'id');
      assertAddRemoveProp(this.props, prevProps, 'autoClean');

      if (!isNil(val)) {
        assertType(`value of field "${this.componentID}" or null/undefined`, this.valueType, val);
      }
    }

    if (this.props.name !== prevProps.name) {
      this.mediator.rename(this.props.name);
    }

    this._notifyValueOnChange(val);

    this.validate(val);
  }
}
