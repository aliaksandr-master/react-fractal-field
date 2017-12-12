import React from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import once from 'lodash/once';
import isEqual from 'lodash/isEqual';
import Store from '../utils/Store';
import { TYPE } from '../utils/const';
import PrimitiveEE from '../utils/PrimitiveEE';
import KeyComponent from './KeyComponent';
import FieldComponent from './FieldComponent';



const globalFocus$ = PrimitiveEE();

const Field = class Field extends FieldComponent {

  static propTypes = {
    ...FieldComponent.propTypes,
    normalize: PropTypes.func,
    format: PropTypes.func
  };

  static defaultProps = {
    ...FieldComponent.defaultProps,
    normalize: null,
    format: null
  };

  constructor (...args) {
    super(...args);

    this._prevFormat = undefined;
    this._prevFormatValue = undefined;
    this._prevFormattedValue = undefined;

    this._prevNormalize = undefined;
    this._prevNormalizeValue = undefined;
    this._prevNormalizedValue = undefined;

    this.onControlChange = this.onControlChange.bind(this);
    this.onControlFocus = this.onControlFocus.bind(this);
    this.onControlBlur = this.onControlBlur.bind(this);
  }

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      value: undefined
    };
  }

  onChange (value) {
    value = this.normalize(value);

    super.onChange(value);
  }

  calcParams () {
    const params = super.calcParams();

    return {
      ...params,
      control: {
        value: this.format(params.value),
        onChange: this.onControlChange,
        onFocus: this.onControlFocus,
        onBlur: this.onControlBlur
      }
    };
  }

  disableGlobalFocus () {}

  onControlChange (ev) {
    let value;

    if (ev && ev.target && ev.target.type) { // eslint-disable-line lodash-fp/prefer-get
      value = ev.target.type === 'checkbox' ? Boolean(ev.target.checked) : ev.target.value;
    } else {
      value = ev;
    }

    this.onChange(value);
  }

  onControlFocus () {
    this.mediator.focus();

    globalFocus$.emit(this.componentID);

    this.disableGlobalFocus();

    this.disableGlobalFocus = globalFocus$.once((componentID) => {
      if (componentID === this.componentID) {
        return;
      }

      this.onControlBlur();
    });
  }

  onControlBlur () {
    this.mediator.blur();
    this.disableGlobalFocus();
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

  componentWillUnmount () {
    super.componentWillUnmount();

    this.disableGlobalFocus();
  }
};

export default Field;
