/*eslint-disable eslint-comments/no-unlimited-disable*/
/*eslint-disable*/

import React, { Component } from 'react';
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import isEqual from 'lodash/isEqual';
import ReactJson from 'react-json-view';

export const composeFilter = (...filters) => (value) => filters.reduce((result, filter) => filter(result), value);

export const priceRemove = (currency) => (value) => {
  let tmp = value;

  for (let i = 0; i < 10; i++) {
    tmp = String(value || '').replace(`${currency} `, '') || '';

    if (tmp !== value) {
      value = tmp;
    } else {
      return tmp;
    }
  }

  return value;
};

export const priceAdd = (currency) => (value) => {
  return `${currency} ${String(priceRemove(currency)(value))}`;
};

export const toFloat = () => (value) => {
  if (isNumber(value)) {
    return value;
  }

  const number = parseFloat(String(value || ''));

  if (isNaN(number)) {
    return 0;
  }

  return number;
};

export const toFixed = (accuracy) => (value) => {
  if (isNumber(value)) {
    return value.toFixed(accuracy);
  }

  throw new Error('invalid type!');
};

export const defaults = (defaultValue, strict = true) => (value) => {
  if (strict) {
    if (value === undefined) {
      return defaultValue;
    }

    return value;
  }

  if (isNil(value) || isNaN(value)) {
    return defaultValue;
  }

  return value;
};



// validators
export const required = () => (value) => isNil(value) || isNaN(value) || value === '' ? 'required' : null;

export const numberGTE = (max) => (value) => isNumber(value) && value >= max ? null : `need to be > ${max}`;

export const patternFloat = () => (value) => /^\d+.?\d*$/.test(value) ? null : 'invalid format';


export const Wrapper = ({ children }) => (
  <div style={{ border: '1px solid #aaa', padding: '10px', margin: '20px 0' }}>{children}</div>
);


// components
export const ErrorBlock = ({ children, valid, error, hasException, style = {} }) => {
  valid = !error && valid;

  return (
    <div>
      <div style={{ background: !valid ? 'red' : 'green', padding: 2, minHeight: 20, ...style }}>
        {children || (<div style={{ lineHeight: '20px', color: 'white', textAlign: 'center' }}>{!valid ? 'INVALID' : 'VALID'}</div>)}
      </div>
      {(error || hasException) && (
        <div style={{ color: 'red' }}>
          {hasException ? 'exception' : 'error'}: {error && (Array.isArray(error) ? error[0] : error)}
        </div>
      )}
    </div>
  );
};

export const FieldRadio = ({ valid, error, hasException, children, ...props }) => (
  <ErrorBlock error={error} valid={valid} hasException={hasException}>
    <label>
      <input {...props} type="radio" />
      {children}
    </label>
  </ErrorBlock>
);

export const FieldInput = ({ error, valid, hasException, ...props }) => (
  <ErrorBlock error={error} valid={valid} hasException={hasException}>
    <input type="text" {...props} />
  </ErrorBlock>
);

export const FieldCheckBox = ({ error, valid, children, hasException, ...props }) => (
  <ErrorBlock error={error} valid={valid} hasException={hasException}>
    <label>
      <input {...props} type="checkbox" />
      {children}
    </label>
  </ErrorBlock>
);


export const Info = class Info extends Component {

  constructor (...args) {
    super(...args);

    this.state = {
      isActive: false
    };

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  shouldComponentUpdate (newProps, newState) {
    return !isEqual(this.props, newProps) || !isEqual(newState, this.state);
  }

  handleMouseEnter () {
    this.setState({ isActive: true }); // eslint-disable-line react/no-set-state
  }

  handleMouseLeave () {
    this.setState({ isActive: false }); // eslint-disable-line react/no-set-state
  }

  render () {
    const { label, data, open = false } = this.props;

    const id = label.replace(/[^a-zA-Z0-9_]+/g, '_');

    const isActive = open || this.state.isActive;

    return (
      <div id={id} className="dd-info" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <div><b>{label}</b></div>
        {!open && (
          <style>
            {`#${id} { position: relative; cursor: pointer; } #${id} > .dd-info__in { z-index: 999; padding: 10px; border: 1px solid rgba(0,0,0,0.5); box-shadow: 0 2px 10px rgba(0,0,0,0.5); background: white; position: absolute; top: 100%; left: 0; }`}
          </style>
        )}
        {isActive && (
          <div className="dd-info__in" style={{ paddingBottom: 20 }}>
            {Array.isArray(data) || isPlainObject(data)
              ? (
                <ReactJson enableClipboard={false} name={false} src={data} />
              ) : (
                <div style={{ minHeight: 14 }}>
                  {data === undefined
                    ? (
                      <em>undefined</em>
                    ) : (
                      data === null
                        ? (
                          <em>null</em>
                        ) : (
                          isNaN(data)
                            ? (
                              <em>NaN</em>
                            ) : (
                              JSON.stringify(data)
                            )
                        )
                    )
                  }
                </div>
              )
            }
          </div>
        )}
      </div>
    );
  }
};
