import PropTypes from 'prop-types';
import React, { Component } from 'react';
import isFunction from 'lodash/isFunction';
import memoize from 'lodash/memoize';
import isEqual from 'lodash/isEqual';
import Store from '../utils/Store';
import composeValidators from '../utils/compose-validators';
import { TYPE, SHARE } from '../utils/const';
import Mediator from '../utils/FieldMediator';
import KeyComponent from './KeyComponent';



let counter = 0;
const salt = Date.now();

export default class FieldComponent extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    name: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),

    value: PropTypes.any,
    onChange: PropTypes.func,

    meta: PropTypes.object,
    onChangeMeta: PropTypes.func,

    validate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]),

    reinitialize: PropTypes.bool,

    initialValue: PropTypes.any,

    onSubmit: PropTypes.func,

    exceptionMessage: PropTypes.any,

    share: PropTypes.oneOf(Object.values(SHARE)).isRequired,
    debug: PropTypes.bool,

    children: PropTypes.oneOfType([ PropTypes.func, PropTypes.node ]).isRequired
  };

  static defaultProps = {
    reinitialize: false,
    exceptionMessage: 'Invalid Value',
    validate: null,
    share: SHARE.ALL,
    initialValue: undefined,
    debug: false,
    onSubmit: () => {},
    onChange: () => {}
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

  getType () {
    return TYPE.SIMPLE;
  }

  getInitialParams () {
    let value;
    const defaultValue = this.provideValueStorage ? this.props.value || this.props.initialValue : this.props.initialValue;

    if (this.context._fractalFieldMediator && this.props.name) {
      const tmpVal = this.context._fractalFieldMediator.getState().value;

      value = tmpVal ? tmpVal[this.props.name] : defaultValue;

      if (value === undefined) {
        value = defaultValue;
      }
    } else {
      value = defaultValue;
    }

    console.log(value);

    return {
      share: this.props.share,
      value,
      name: this.props.name,
      type: this.getType()
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

    this.isolated = (this.provideValueStorage && this.provideMetaStorage) || !this.hasParentForm || this.props.share === SHARE.NONE;

    this.mediator = new Mediator(this.componentID, this.isolated ? null : this.context._fractalFieldMediator, { debug: this.props.debug });

    this.flushInitializeTransaction = this.mediator.transaction();

    this.mediator.mount(this.getInitialParams());

    this._paramsVersion = null;
    this._prevParams = null;

    this._renderedVersion = 0;

    this._initialValueVersionVersion = 0;

    this.renderChildren = this.renderChildren.bind(this);
    this.render = this.render.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
    this.triggerSubmit = this.triggerSubmit.bind(this);
    this.triggerReset = this.triggerReset.bind(this);
    this.cache = memoize(this.cache, (key, _func) => key).bind(this);

    if (this.isolated) {
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
  }

  getState () {
    return this.mediator.getState();
  }

  cache (key, func) {
    return func();
  }

  triggerChange (normalizedValue) {
    this.mediator.changeValue(normalizedValue);

    if (this.props.onChange) {
      this.props.onChange(normalizedValue);
    }
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

  componentDidMount () {
    console.log('INIT', this.componentID);
    this.validate();
    this.flushInitializeTransaction();
  }

  componentWillUnmount () {
    this.mediator.destroy();
  }

  componentWillUpdate () {
    //this.flushChanges = this.mediator.transaction();
  }

  componentDidUpdate (prevProps, prevState) {
    const flush = this.mediator.transaction();

    //this.flushChanges();

    this.onUpdate(prevProps, prevState);

    flush();
  }

  onUpdate (prevProps) {
    if (process.env.NODE_ENV !== 'production') {
      if (this.props.id !== prevProps.id) {
        throw new Error('you must not change id prop');
      }

      if (this.props.share !== prevProps.share) {
        throw new Error('you must not change share prop');
      }

      if (this.props.hasOwnProperty('value') !== prevProps.hasOwnProperty('value')) {
        throw new Error('you must not change value prop');
      }

      if (this.props.hasOwnProperty('onChange') !== prevProps.hasOwnProperty('onChange')) {
        throw new Error('you must not change onChange prop');
      }

      if (this.props.hasOwnProperty('onChangeMeta') !== prevProps.hasOwnProperty('onChangeMeta')) {
        throw new Error('you must not change onChangeMeta prop');
      }

      if (this.props.hasOwnProperty('meta') !== prevProps.hasOwnProperty('meta')) {
        throw new Error('you must not change onChangeMeta prop');
      }
    }

    if (this.props.name !== prevProps.name) {
      this.mediator.rename(this.props.name);
    }

    this.validate();
  }
}
