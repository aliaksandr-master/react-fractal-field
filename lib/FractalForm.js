import React from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import once from 'lodash/once';
import Store from './Store';
import KeyComponent from './KeyComponent';
import PrimitiveEE from './PrimitiveEE';
import FractalComponent from './FractalComponent';


const FractalForm = class FractalForm extends FractalComponent {

  static defaultProps = {
    ...FractalComponent.defaultProps,
    reinitialize: false,
    onSubmit: () => {},
    exception: 'Invalid'
  };

  static propTypes = {
    ...FractalComponent.propTypes,
    initialValue: PropTypes.any,
    reinitialize: PropTypes.bool,
    onSubmit: PropTypes.func
  };

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      field: false,
      value: undefined
    };
  }

  constructor (...args) {
    super(...args);

    this._renderedVersion = undefined;

    this.superRender = super.render.bind(this);

    this.mediator.onChange(() => {
      if (this.mediator.store.version === this._renderedVersion) {
        return;
      }

      this.setState(this.mediator.getState());
    });
  }

  calcParams () {
    const params = super.calcParams();

    return {
      ...params,
      triggerSubmit: this.onSubmit,
      triggerReset: this.onReset
    };
  }

  render () {
    const { reinitialize } = this.props;

    console.log('RENDER', this.componentID);

    this._renderedVersion = this.mediator.store.version;

    if (reinitialize) {
      return <KeyComponent key={`key-${this._initialValueVersionVersion}`}>{this.superRender}</KeyComponent>;
    }

    return this.superRender();
  }
};

export default FractalForm;
