import React from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import once from 'lodash/once';
import isEqual from 'lodash/isEqual';
import Store from '../utils/Store';
import { TYPE } from '../utils/const';
import { logWarn } from '../utils/log';
import PrimitiveEE from '../utils/PrimitiveEE';
import KeyComponent from './KeyComponent';
import FieldComponent from './FieldComponent';



const globalFocus$ = PrimitiveEE();

const Field = class Field extends FieldComponent {

  static propTypes = {
    ...FieldComponent.propTypes,
    normalize: PropTypes.func,
    preferState: PropTypes.bool,
    format: PropTypes.func
  };

  static defaultProps = {
    ...FieldComponent.defaultProps,
    normalize: null,
    preferState: false,
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

    this.state = {
      ...this.state,
      value: undefined
    };

    this._changeValueIsPrevented = false;

    this.handleControlChange = this.handleControlChange.bind(this);
    this.handleControlFocus = this.handleControlFocus.bind(this);
    this.handleControlBlur = this.handleControlBlur.bind(this);
  }

  triggerChange (value) {
    value = this.normalize(value);

    if (this._changeValueIsPrevented) {
      this.setState((prevState) => ({
        ...prevState,
        value
      }));
      return;
    }

    super.triggerChange(value);
  }

  _preventChange () {
    if (!this.props.preferState || this._changeValueIsPrevented) {
      return;
    }

    this._changeValueIsPrevented = true;

    this.setState((prevState) => ({
      ...prevState,
      value: this.getState().value
    }));
  }

  _modParamsValue (paramsValue) {
    if (this._changeValueIsPrevented) {
      paramsValue = this.state.value;
    }

    return this.format(paramsValue);
  }

  _swapValue () {
    if (!this._changeValueIsPrevented) {
      return;
    }

    this._changeValueIsPrevented = false;
    super.triggerChange(this.state.value);
  }

  calcParams () {
    const params = super.calcParams();

    const value = this._modParamsValue(params.value);

    return {
      ...params,
      value,
      control: {
        value,
        onChange: this.handleControlChange,
        onFocus: this.handleControlFocus,
        onBlur: this.handleControlBlur
      }
    };
  }

  disableGlobalFocus () {}

  handleControlChange (ev) {
    let value;

    if (ev && ev.target && ev.target.type) { // eslint-disable-line lodash-fp/prefer-get
      value = ev.target.type === 'checkbox' ? Boolean(ev.target.checked) : ev.target.value;
    } else {
      value = ev;
    }

    this.triggerChange(value);
  }

  handleControlFocus () {
    this.mediator.focus();

    this._preventChange();

    globalFocus$.emit(this.componentID);

    this.disableGlobalFocus();

    this.disableGlobalFocus = globalFocus$.once((componentID) => {
      if (componentID === this.componentID) {
        return;
      }

      this.handleControlBlur();
    });
  }

  handleControlBlur () {
    this.disableGlobalFocus();

    const flush = this.mediator.transaction();

    this.mediator.blur();
    this._swapValue();

    flush();
  }

  normalize (value) {
    const { normalize } = this.props;

    if (!normalize) {
      return value;
    }

    if (!(isEqual(value, this._prevNormalizeValue) && this._prevNormalize === normalize)) {
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

    if (!(isEqual(value, this._prevFormatValue) && this._prevFormat === format)) {
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
      if (this.props.format !== prevProps.format) {
        logWarn('format prop was changed. it could affect to performance of form');
      }

      if (this.props.normalize !== prevProps.normalize) {
        logWarn('normalize prop was changed. it could affect to the performance of form');
      }

      if (this.props.preferState !== prevProps.preferState) {
        logWarn('preferState prop was changed. it could affect to the performance of form');
      }
    }
  }

  componentWillUnmount () {
    super.componentWillUnmount();

    this.disableGlobalFocus();
  }
};

export default Field;
