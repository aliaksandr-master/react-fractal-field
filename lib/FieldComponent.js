import { Component } from 'react';
import isFunction from 'lodash/isFunction';
import memoize from 'lodash/memoize';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import Mediator from './FieldMediator';
import Store from './Store';
import composeValidators from './compose-validators';
import KeyComponent from './KeyComponent';
import { TYPE } from './const';



let counter = 0;

export default class FieldComponent extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    name: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    value: PropTypes.any,
    validate: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]),
    children: PropTypes.oneOfType([ PropTypes.func, PropTypes.node ]).isRequired,
    reinitialize: PropTypes.bool,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    exceptionMessage: PropTypes.any,
    isolated: PropTypes.bool
  };

  static defaultProps = {
    reinitialize: false,
    exceptionMessage: 'Invalid Value',
    validate: null,
    isolated: false,
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
    return {
      isolated: this.isolated,
      name: this.props.name,
      type: this.getType()
    };
  }

  getState () {
    return this.mediator.getState();
  }

  constructor (...args) {
    super(...args);

    this.componentID = this.props.id || `fractal-field-#${++counter}`;

    this.hasParentForm = Boolean(this.context._fractalFieldMediator);

    this.isolated = !this.hasParentForm || Boolean(this.props.isolated);

    this.mediator = new Mediator(this.componentID, this.context._fractalFieldMediator);

    this.mediator.mount(this.getInitialParams());

    this._paramsVersion = null;
    this._prevParams = null;

    this._renderedVersion = 0;

    this._initialValueVersionVersion = 0;

    this.renderChildren = this.renderChildren.bind(this);
    this.render = this.render.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onReset = this.onReset.bind(this);
    this.cache = memoize(this.cache, (key, _func) => key).bind(this);

    if (this.isolated) {
      this.mediator.onChange(() => {
        if (this.mediator.store.version === this._renderedVersion) {
          return;
        }

        console.log('TRIGGER SET STATE', this.componentID);

        this.setState(this.mediator.getState()); // eslint-disable-line react/no-set-state
      });
    }
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
    this.mediator.submitStart();
    Promise.resolve(this.props.onSubmit())
      .then(
        () => {
          this.mediator.submitDone();
        },
        (err) => {
          this.mediator.submitFailed(err);
        }
      );
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

    const hasException = state.hasFormatException || state.hasNormalizeException || state.hasValidateException;

    return {
      cache: this.cache,
      triggerChange: this.onChange,
      triggerSubmit: this.onSubmit,
      triggerReset: this.onReset,
      submitted: state.submitted,
      submitting: state.submitting,
      error: hasException ? this.props.exceptionMessage : state.error,
      valid: state.valid,
      value: state.value,
      touched: state.touched,
      active: state.active,
      activated: state.activated,
      hasException
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

  renderChildren () {
    const { children } = this.props;

    this._renderedVersion = this.mediator.store.version;

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
    this.mediator.init();
  }

  componentWillUnmount () {
    this.mediator.destroy();
  }

  componentWillUpdate () {
    //this.flushChanges = this.mediator.transaction();
  }

  onUpdate ({ id, name }) {
    if (process.env.NODE_ENV !== 'production') {
      if (this.props.id !== id) {
        throw new Error('you must not change id prop');
      }
    }

    if (this.props.name !== name) {
      this.mediator.rename(this.props.name);
    }

    this.validate();
  }

  componentDidUpdate (prevParams) {
    const flush = this.mediator.transaction();

    this.onUpdate(prevParams);

    flush();
  }
}
