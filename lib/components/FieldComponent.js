import PropTypes from 'prop-types';
import React, { Component } from 'react';
import isFunction from 'lodash/isFunction';
import memoize from 'lodash/memoize';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import Store from '../utils/Store';
import composeValidators from '../utils/compose-validators';
import assertAddRemoveProp from '../assert/assertAddRemoveProp';
import assertChangeProp from '../assert/assertChangeProp';
import assertType from '../assert/assertType';
import assertSameType from '../assert/assertSameType';
import { TYPE, SHARE } from '../utils/const';
import Mediator from '../utils/FieldMediator';
import { blur, change, reset, initialize, submit } from '../stream/index';
import PrimitiveEE from '../utils/PrimitiveEE';
import KeyComponent from './KeyComponent';



let counter = 0;
const salt = Date.now();

//const mkDefaultValue = (type, initialValue) => {
//  if (initialValue) {
//    return initialValue;
//  }
//
//  if (type === TYPE.COMPLEX) {
//    throw new ReferenceError('initial value must be specified!');
//  }
//
//  if (type === TYPE.SIMPLE) {
//    throw new ReferenceError('initial value must be specified!');
//  }
//
//  if (type === TYPE.BOOLEAN) {
//    return false;
//  }
//
//  if (type === TYPE.STRING) {
//    return '';
//  }
//
//  if (type === TYPE.NUMBER) {
//    return 0;
//  }
//
//  if (type === TYPE.OBJECT) {
//    return {};
//  }
//
//  if (type === TYPE.ARRAY) {
//    return [];
//  }
//
//  throw new TypeError('invalid type');
//};

export default class FieldComponent extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    name: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    type: PropTypes.oneOf(Object.values(TYPE)).isRequired,

    value: PropTypes.any,
    onChange: PropTypes.func,

    meta: PropTypes.object,
    onChangeMeta: PropTypes.func,

    validate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]),

    reinitialize: PropTypes.bool,

    initialValue: PropTypes.any,

    onSubmit: PropTypes.func,

    exceptionMessage: PropTypes.any,

    share: PropTypes.oneOf(Object.values(SHARE)),
    debug: PropTypes.bool,

    children: PropTypes.func.isRequired
  };

  static defaultProps = {
    reinitialize: false,
    exceptionMessage: 'Invalid Value',
    validate: null,
    type: TYPE.SIMPLE,
    share: null,
    initialValue: undefined,
    debug: false,
    onSubmit: null,
    onChange: null
  };

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

  getInitialParams () {
    let value;
    const defaultValue = this.provideValueStorage ? (this.props.value === undefined ? this.props.initialValue : this.props.value) : this.props.initialValue;

    if (this.context._fractalFieldMediator && this.props.name) {
      const tmpVal = this.context._fractalFieldMediator.getState().value;

      value = tmpVal ? tmpVal[this.props.name] : defaultValue;

      if (value === undefined) {
        value = defaultValue;
      }
    } else {
      value = defaultValue;
    }

    console.log('INITIAL VALUE', this.componentID, value);

    return {
      share: this.share,
      value,
      name: this.props.name,
      type: this.props.type
    };
  }

  constructor (...args) {
    super(...args);

    this.state = {
      field: {}
    };

    this.provideValueStorage = this.props.hasOwnProperty('value') && this.props.hasOwnProperty('onChange');
    this.provideMetaStorage = this.props.hasOwnProperty('meta') && this.props.hasOwnProperty('onChangeMeta');

    this.componentID = this.props.id || `fractal-field-${salt}-${++counter}`;

    this.hasParentForm = Boolean(this.context._fractalFieldMediator);

    if (this.provideValueStorage && this.provideMetaStorage || !this.hasParentForm) {
      this.share = SHARE.NONE;
    } else if (this.provideValueStorage || !this.props.name) {
      this.share = SHARE.META;
    } else if (this.provideMetaStorage) {
      this.share = SHARE.VALUE;
    } else if (this.props.share) {
      this.share = this.props.share;
    } else {
      this.share = SHARE.ALL;
    }

    this.mediator = new Mediator(this.componentID, this.share === SHARE.NONE ? null : this.context._fractalFieldMediator, { debug: this.props.debug });

    this.flushInitializeTransaction = this.mediator.transaction();

    this.mediator.mount(this.getInitialParams());

    this._paramsVersion = null;
    this._prevParams = null;

    this._notifiedChangeValue = undefined;

    this._renderedVersion = 0;

    this._initialValueVersionVersion = 0;

    this.renderChildren = this.renderChildren.bind(this);
    this.render = this.render.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
    this.triggerSubmit = this.triggerSubmit.bind(this);
    this.triggerReset = this.triggerReset.bind(this);
    this.cache = memoize(this.cache, (key, _func) => key).bind(this);

    if (this.share === SHARE.NONE) {
      this.mediator.onChange(() => {
        if (this.mediator.version() === this._renderedVersion) {
          return;
        }

        console.log('TRIGGER SET STATE', this.componentID);

        this.setState((prevState) => ({ // eslint-disable-line react/no-set-state
          ...prevState,
          field: this.getState()
        }));
      });
    }

    this._destroy$ = PrimitiveEE();
  }

  onDestroy (listener) {
    return this._destroy$.on(listener);
  }

  getState () {
    return this.mediator.getState();
  }

  cache (key, func) {
    return func();
  }

  notifyOnChange () {
    if (!this.props.onChange) {
      return;
    }

    const value = this.getState().value;

    if (this._notifiedChangeValue === value) {
      return;
    }

    this._notifiedChangeValue = value;

    this.props.onChange(value);
  }

  triggerChange (normalizedValue) {
    this.mediator.changeValue(normalizedValue);

    this.notifyOnChange();
  }

  triggerReset () {

  }

  triggerSubmit (ev) {
    if (ev) {
      ev.preventDefault();
    }

    const flush = this.mediator.transaction();

    this.mediator.submitStart();

    if (!this.getState().valid) {
      this.mediator.submit();
      flush();
      return Promise.reject(null); // eslint-disable-line prefer-promise-reject-errors
    }

    if (!this.props.onSubmit) {
      this.mediator.submitDone();
      flush();
      return Promise.reject(null); // eslint-disable-line prefer-promise-reject-errors
    }

    const state = this.getState();

    flush();

    return new Promise(() => {
      return Promise.resolve(this.props.onSubmit(state.value, state));
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

  validate () {
    const { validate } = this.props;
    const flush = this.mediator.transaction();

    const validateIsArray = Array.isArray(validate);

    if (!validate || (validateIsArray && !validate.length)) {
      this.mediator.changeValidity(null);
      flush();
      return true;
    }

    const state = this.getState();
    const value = state.value;

    if (isEqual(value, this._prevValidatedValue) && this._prevValidate === validate) {
      flush();
      return !state.error;
    }

    let error = null;
    let _validate = validate;

    if (validateIsArray) {
      _validate = composeValidators(...validate);
    }

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

    const hasException = state.hasFormatException || state.hasNormalizeException || state.hasValidateException;

    const params = {
      cache: this.cache,
      triggerChange: this.triggerChange,
      triggerSubmit: this.triggerSubmit,
      triggerReset: this.triggerReset,
      submitted: state.submitted,
      submitFailed: state.submitFailed,
      submitSuccess: state.submitSuccess,
      submitting: state.submitting,
      error: hasException ? this.props.exceptionMessage : state.error,
      errorFields: this.mediator.dehydrateNames(state.errorsIn).filter(Boolean),
      valid: state.valid,
      value: state.value,
      touched: state.touched,
      active: state.active,
      activated: state.activated,
      hasException
    };

    if (this.props.debug) {
      params.$state = this.mediator._store._state; // TODO: remove this. only form development
    }

    return params;
  }

  _calcParams () {
    if (this._paramsVersion === this.mediator.version()) {
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
    const { reinitialize } = this.props;

    console.log('RENDER', this.componentID);

    if (reinitialize) {
      return <KeyComponent key={`key-${this._initialValueVersionVersion}`}>{this.renderChildren}</KeyComponent>;
    }

    return this.renderChildren();
  }

  render () {
    return this.renderInner();
  }

  subscribeGlobalStreams () {
    this.onDestroy(change.subscribe(this.componentID, (componentID, value) => this.triggerChange(value)));

    this.onDestroy(reset.subscribe(this.componentID, () => this.triggerReset()));

    this.onDestroy(initialize.subscribe(this.componentID, () => {
      // TODO: trigger initialize
    }));

    this.onDestroy(submit.subscribe(this.componentID, () => this.triggerSubmit()));
  }

  componentDidMount () {
    console.log('INIT', this.componentID);
    this.validate();
    this.flushInitializeTransaction();
    this.subscribeGlobalStreams();
  }

  componentWillUnmount () {
    this._destroy$.emit();
    this._destroy$.destroy();
    this.mediator.destroy();
  }

  componentWillUpdate () {
    //this.flushChanges = this.mediator.transaction();
  }

  componentDidUpdate (prevProps, prevState) {
    const flush = this.mediator.transaction();

    //this.flushChanges();

    this.onUpdate(prevProps, prevState);

    this._prevCheckedValue = this.getState().value;

    flush();
  }

  onUpdate (prevProps) {
    if (process.env.NODE_ENV !== 'production') {
      assertChangeProp(this.props, prevProps, 'id');
      assertChangeProp(this.props, prevProps, 'share');
      assertChangeProp(this.props, prevProps, 'type');
      assertAddRemoveProp(this.props, prevProps, 'value');
      assertAddRemoveProp(this.props, prevProps, 'name');
      assertAddRemoveProp(this.props, prevProps, 'onChange');
      assertAddRemoveProp(this.props, prevProps, 'onChangeMeta');
      assertAddRemoveProp(this.props, prevProps, 'meta');

      const val = this.getState().value;

      if (!isNil(this._prevCheckedValue) && !isNil(val)) {
        assertType(`value of field "${this.componentID}"`, this.props.type, val);
        assertSameType(`value of field "${this.componentID}"`, val, this._prevCheckedValue);
      }

      this._prevCheckedValue = val;

      if (this.mediator.hasNamedChildren() && ![ TYPE.COMPLEX, TYPE.ARRAY, TYPE.OBJECT ].includes(this.props.type)) {
        throw new TypeError(`in case of type is ${this.props.type} field "${this.componentID}" must not be complex`);
      }
    }

    if (this.props.name !== prevProps.name) {
      this.mediator.rename(this.props.name);
    }

    this.notifyOnChange();

    this.validate();
  }
}
