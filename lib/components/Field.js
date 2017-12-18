import React from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import once from 'lodash/once';
import isEqual from 'lodash/isEqual';
import Store from '../utils/Store';
import { TYPE } from '../utils/const';
import { logWarn } from '../utils/log';
import { blur, focus } from '../utils/global';
import PrimitiveEE from '../utils/PrimitiveEE';
import FieldComponent from './FieldComponent';



const warnPerformanceIfPropChanges = (currentProps, prevProps, propName) => {
  if (currentProps[propName] !== prevProps[propName]) {
    logWarn(`"${propName}" prop was changed. it could affect to performance of form`);
  }
};

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
    format: null,
    type: TYPE.SIMPLE
  };

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
    if (!this.props.preferState || this._changeValueIsPrevented) {
      return;
    }

    this._changeValueIsPrevented = true;

    this.changeValue(this.getState().value);
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
      if (componentID === this.componentID) {
        return;
      }

      this.handleControlBlur();
    }));

    this.onDestroy(this.disableGlobalFocus);
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
      warnPerformanceIfPropChanges(this.props, prevProps, 'format');
      warnPerformanceIfPropChanges(this.props, prevProps, 'normalize');
      warnPerformanceIfPropChanges(this.props, prevProps, 'preferState');
    }
  }

  componentWillUnmount () {
    super.componentWillUnmount();

    this.disableGlobalFocus();
  }
};

export default Field;
