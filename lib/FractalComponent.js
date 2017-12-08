import { Component } from 'react';
import isFunction from 'lodash/isFunction';
import memoize from 'lodash/memoize';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import FractalFormMediator from './FractalMediator';
import Store from './Store';
import composeValidators from './compose-validators';



let counter = 0;

export default class FractalComponent extends Component {
  static propTypes = {
    validate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]),
    children: PropTypes.oneOfType([ PropTypes.func, PropTypes.node ]).isRequired,
    onChange: PropTypes.func
  };

  static defaultProps = {
    validate: null
  };

  static childContextTypes = {
    _formMediator$: PropTypes.object
  };

  static contextTypes = {
    _formMediator$: PropTypes.object
  };

  getChildContext () {
    return {
      _formMediator$: this.mediator
    };
  }

  getInitialParams () {
    return {};
  }

  getState () {
    return this.mediator.getState();
  }

  constructor (...args) {
    super(...args);

    this.componentID = ++counter;

    this.hasParentForm = Boolean(this.context._formMediator$);

    this.mediator = new FractalFormMediator(this.componentID, this.context._formMediator$);

    this.mediator.mount(this.getInitialParams());

    this._paramsVersion = null;
    this._prevParams = null;

    this.render = this.render.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onReset = this.onReset.bind(this);
    this.cache = memoize(this.cache, (key, _func) => key).bind(this);
  }

  componentDidMount () {
    console.log('INIT', this.componentID);
    this.validate();
    this.mediator.init();
  }

  componentWillUnmount () {
    this.mediator.destroy();
  }

  componentWillUpdate () {
    //this.flushChanges = this.mediator.transaction();
  }

  onUpdate (_prevParams) {
    this.validate();
  }

  componentDidUpdate (prevParams) {
    const flush = this.mediator.transaction();

    this.onUpdate(prevParams);

    flush();
  }

  cache (key, func) {
    return func();
  }

  onChange (normalizedValue) {
    this.mediator.changeValue(normalizedValue);

    if (this.props.onChange) {
      this.props.onChange(normalizedValue);
    }
  }

  onReset () {

  }

  onSubmit () {

  }

  validate () {
    const { validate } = this.props;

    const validateIsArray = Array.isArray(validate);

    if (!validate || (validateIsArray && !validate.length)) {
      this.mediator.changeValidity(null);
      return;
    }

    const value = this.getState().value;

    if (isEqual(value, this._prevValidatedValue) && this._prevValidate === validate) {
      return;
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
      return;
    }

    this.mediator.sysValidateError(null);

    this.mediator.changeValidity(error);
  }

  calcParams () {
    const state = this.mediator.getState();

    return {
      cache: this.cache,
      triggerChange: this.onChange,
      ...state
    };
  }

  _calcParams () {
    if (this._paramsVersion === this.mediator.store.version) {
      return this._prevParams;
    }

    this._paramsVersion = this.mediator.store.version;

    const params = this.calcParams();

    this._prevParams = params;

    return params;
  }

  render () {
    const { children } = this.props;

    return isFunction(children) ? children(this._calcParams()) : children;
  }
}
