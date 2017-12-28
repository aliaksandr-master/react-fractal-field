import React from 'react';
import PropTypes from 'prop-types';
import once from 'lodash/once';
import isEqual from 'lodash/isEqual';
import { logWarn } from '../utils/log';
import { blur, focus } from '../utils/global';
import FieldComponent from './FieldComponent';



const warnPerformanceIfPropChanges = (currentProps, prevProps, propName) => {
  if (currentProps[propName] !== prevProps[propName]) {
    logWarn(`"${propName}" prop was changed. it could affect to performance of form`);
  }
};

const Field = class Field extends FieldComponent {

  static propTypes = {
    ...FieldComponent.propTypes,
    normalize: PropTypes.func,
    postpone: PropTypes.bool,
    format: PropTypes.func
  };

  static defaultProps = {
    ...FieldComponent.defaultProps,
    normalize: null,
    postpone: false,
    format: null
  };

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      simple: true
    };
  }

  constructor (...args) {
    super(...args);

    this._prevFormat = undefined;
    this._prevFormatValue = undefined;
    this._prevFormattedValue = undefined;

    this._prevNormalize = undefined;
    this._prevNormalizeValue = undefined;
    this._prevNormalizedValue = undefined;

    this._value = undefined;

    this.state = {
      ...this.state,
      value: undefined
    };

    this._changeValueIsPrevented = false;

    this.handleControlChange = this.handleControlChange.bind(this);
    this.handleControlFocus = this.handleControlFocus.bind(this);
    this.handleControlBlur = this.handleControlBlur.bind(this);
  }

  subscribeGlobalStreams () {
    super.subscribeGlobalStreams();

    this.onDestroy(blur.subscribe(this.componentID, () => {
      this.handleControlBlur();
    }));
  }

  getStateValue () {
    return this._value;
  }

  changeValue (value) {
    this._value = value;
    this.setState((prevState) => ({
      ...prevState,
      value
    }));
  }

  triggerChange (value) {
    value = this.normalize(value);

    if (this._changeValueIsPrevented) {
      this.changeValue(value);
      return;
    }

    super.triggerChange(value);
  }

  _preventChange () {
    if (!this.props.postpone || this._changeValueIsPrevented) {
      return;
    }

    this._changeValueIsPrevented = true;

    this.changeValue(this.getValue());
  }

  _modParamsValue (paramsValue) {
    if (this._changeValueIsPrevented) {
      paramsValue = this.getStateValue();
    }

    return this.format(paramsValue);
  }

  _swapValue () {
    if (!this._changeValueIsPrevented) {
      return;
    }

    this._changeValueIsPrevented = false;
    super.triggerChange(this.getStateValue());
  }

  calcParams () {
    const params = super.calcParams();

    const value = this._modParamsValue(params.value);

    return {
      ...params,
      value,
      triggerFocus: this.handleControlFocus,
      triggerBlur: this.handleControlBlur,
      preventedChange: this._changeValueIsPrevented,
      control: {
        value,
        onChange: this.handleControlChange,
        onFocus: this.handleControlFocus,
        onBlur: this.handleControlBlur
      }
    };
  }

  _calcParams () {
    if (this._changeValueIsPrevented) {
      return this.calcParams();
    }

    return super._calcParams();
  }

  handleControlChange (ev) {
    let value;

    if (ev && ev.target && ev.target.type) { // eslint-disable-line lodash-fp/prefer-get
      value = ev.target.type === 'checkbox' ? Boolean(ev.target.checked) : ev.target.value;
    } else {
      value = ev;
    }

    this.triggerChange(value);
  }

  disableGlobalFocus () {}

  handleControlFocus () {
    this.mediator.focus();

    this._preventChange();

    focus.publish(this.componentID);

    this.disableGlobalFocus();

    this.disableGlobalFocus = focus.subscribeAll(once((componentID) => {
      this.disableGlobalFocus();
      if (componentID === this.componentID) {
        return;
      }

      this.handleControlBlur();
    }));

    this.onDestroy(this.disableGlobalFocus);
  }

  handleControlBlur () {
    const flush = this.mediator.transaction('handleControlBlur');

    this.disableGlobalFocus();

    this.mediator.blur();
    this._swapValue();

    flush();
  }

  normalize (value) {
    const { normalize } = this.props;

    if (!normalize) {
      return value;
    }

    if (this._prevNormalize !== normalize || !isEqual(value, this._prevNormalizeValue)) {
      try {
        this._prevNormalizedValue = normalize(value);
        this._prevNormalize = normalize;
        this._prevNormalizeValue = value;
      } catch (err) {
        this.mediator.sysNormalizeError(err);
        return undefined;
      }

      this.mediator.sysNormalizeError(null);
    }

    return this._prevNormalizedValue;
  }

  format (value) {
    const { format } = this.props;

    if (!format) {
      return value;
    }

    if (this._prevFormat !== format || !isEqual(value, this._prevFormatValue)) {
      try {
        this._prevFormattedValue = format(value);
        this._prevFormat = format;
        this._prevFormatValue = value;
      } catch (err) {
        this.mediator.sysFormatError(err);
        return undefined;
      }

      this.mediator.sysFormatError(null);
    }

    return this._prevFormattedValue;
  }

  onUpdate (prevProps, prevState) {
    super.onUpdate(prevProps, prevState);

    if (process.env.NODE_ENV !== 'production') {
      warnPerformanceIfPropChanges(this.props, prevProps, 'format');
      warnPerformanceIfPropChanges(this.props, prevProps, 'normalize');
      warnPerformanceIfPropChanges(this.props, prevProps, 'postpone');

      if (this.mediator.hasNamedChildren()) {
        throw new TypeError(`when type is ${this.valueType}, field "${this.componentID}" must not be complex`);
      }
    }
  }

  componentWillUnmount () {
    super.componentWillUnmount();

    this.disableGlobalFocus();
  }
};

export default Field;
