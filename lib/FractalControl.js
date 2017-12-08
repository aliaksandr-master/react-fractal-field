import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { Component } from 'react';
import FractalFieldComponent from './FractalFieldComponent';
import PrimitiveEE from './PrimitiveEE';



const globalFocus$ = PrimitiveEE();

const FractalControl = class FractalControl extends FractalFieldComponent {

  static propTypes = {
    ...FractalFieldComponent.propTypes,
    normalize: PropTypes.func,
    format: PropTypes.func
  };

  constructor (...args) {
    super(...args);

    this._prevFormat = undefined;
    this._prevFormatValue = undefined;
    this._prevFormattedValue = undefined;

    this._prevNormalize = undefined;
    this._prevNormalizeValue = undefined;
    this._prevNormalizedValue = undefined;

    this._focusIsActive = false;

    this.onControlChange = this.onControlChange.bind(this);
    this.onControlFocus = this.onControlFocus.bind(this);
    this.onControlBlur = this.onControlBlur.bind(this);
  }

  onChange (value) {
    value = this.normalize(value);

    super.onChange(value);
  }

  onControlChange (ev) {
    let value;

    if (ev && ev.target && ev.target.type) { // eslint-disable-line lodash-fp/prefer-get
      value = ev.target.type === 'checkbox' ? Boolean(ev.target.checked) : ev.target.value;
    } else {
      value = ev;
    }

    this.onChange(value);
  }

  normalize (value) {
    const { normalize } = this.props;

    if (!normalize) {
      return value;
    }

    if (isEqual(value, this._prevNormalizeValue) && this._prevNormalize === normalize) {
      return this._prevNormalizedValue;
    }

    try {
      this._prevNormalizedValue = normalize(value);
      this._prevNormalize = normalize;
      this._prevNormalizeValue = value;
    } catch (err) {
      this.mediator.sysNormalizeError(err);
      return undefined;
    }

    this.mediator.sysNormalizeError(null);

    return this._prevFormattedValue;
  }

  format (value) {
    const { format } = this.props;

    if (!format) {
      return value;
    }

    if (isEqual(value, this._prevFormatValue) && this._prevFormat === format) {
      return this._prevFormattedValue;
    }

    try {
      this._prevFormattedValue = format(value);
      this._prevFormat = format;
      this._prevFormatValue = value;
    } catch (err) {
      this.mediator.sysFormatError(err);
      return undefined;
    }

    this.mediator.sysFormatError(null);

    return this._prevFormattedValue;
  }

  calcParams () {
    const params = super.calcParams();

    const value = this.format(params.value);

    return {
      ...params,
      value,
      control: {
        value,
        onChange: this.onControlChange,
        onFocus: this.onControlFocus,
        onBlur: this.onControlBlur
      }
    };
  }

  componentWillUnmount () {
    super.componentWillUnmount();

    this.disableGlobalFocus();
  }

  disableGlobalFocus () {}

  onControlFocus () {
    this.mediator.focus();
    this._focusIsActive = true;
    globalFocus$.emit(this.componentID);

    this.disableGlobalFocus();

    this.disableGlobalFocus = globalFocus$.on((id) => {
      if (!this._focusIsActive || id === this.componentID) {
        return;
      }

      this.disableGlobalFocus();
      this.mediator.blur();
    });
  }

  onControlBlur () {
    this._focusIsActive = false;
    this.mediator.blur();
    this.disableGlobalFocus();
  }
};

export default FractalControl;
