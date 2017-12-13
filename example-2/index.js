/* eslint-disable react/prop-types, react/jsx-no-bind, react/no-array-index-key, jsx-a11y/label-has-for */
import React, { Component } from 'react';
import { render } from 'react-dom';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import isNaN from 'lodash/isNaN';
import isPlainObject from 'lodash/isPlainObject';
import ReactJson from 'react-json-view';
import FieldSet from '../lib/components/FieldSet';
import FieldList from '../lib/components/FieldList';
import Field from '../lib/components/Field';



// filters
const composeFilter = (...filters) => (value) => filters.reduce((value, filter) => filter(value), value);

const priceRemove = (currency) => (value) => {
  let tmp = value;

  for (let i = 0; i < 10; i++) { // eslint-disable-line
    tmp = String(value || '').replace(`${currency} `, '') || '';

    if (tmp !== value) {
      value = tmp;
    } else {
      return tmp;
    }
  }

  return value;
};

const priceAdd = (currency) => (value) => {
  return `${currency} ${String(priceRemove(currency)(value))}`;
};

const toFloat = () => (value) => isNumber(value) ? value : parseFloat(value || '');

const toFixed = (accuracy) => (value) => {
  if (isNumber(value)) {
    return value.toFixed(accuracy);
  }

  throw new Error('invalid type!');
};

const defaults = (defaultValue, strict = true) => (value) => {
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
const required = () => (value) => isNil(value) || isNaN(value) || value === '' ? 'required' : null;

const numberGTE = (max) => (value) => isNumber(value) && value >= max ? null : `need to be > ${max}`;

const patternFloat = () => (value) => /^\d+.?\d*$/.test(value) ? null : 'invalid format';



// helpers
const omitControl = (data) => Object.keys(data).filter((k) => k !== 'control').reduce((v, k) => ({ ...v, [k]: data[k] }), {});



// components
const ErrorBlock = ({ children, valid, error, hasException, style = {} }) => {
  valid = !error && valid;

  return (
    <div>
      <div style={{ background: !valid ? 'red' : 'green', padding: 2, minHeight: 20, ...style }}>
        {children || (<div style={{ lineHeight: '20px', color: 'white', textAlign: 'center' }}>{!valid ? 'INVALID' : 'VALID'}</div>)}
      </div>
      {error && (
        <div style={{ color: 'red' }}>
          {hasException ? 'exception' : 'error'}: {Array.isArray(error) ? error[0] : error}
        </div>
      )}
    </div>
  );
};

const FieldRadio = ({ valid, error, hasException, children, ...props }) => (
  <ErrorBlock error={error} valid={valid} hasException={hasException}>
    <label>
      <input {...props} type="radio" />
      {children}
    </label>
  </ErrorBlock>
);

const FieldInput = ({ error, valid, hasException, ...props }) => (
  <ErrorBlock error={error} valid={valid} hasException={hasException}>
    <input type="text" {...props} />
  </ErrorBlock>
);

const FieldCheckBox = ({ error, valid, children, hasException, ...props }) => (
  <ErrorBlock error={error} valid={valid} hasException={hasException}>
    <label>
      <input {...props} type="checkbox" />
      {children}
    </label>
  </ErrorBlock>
);

const ExampleBasicUsage = class ExampleBasicUsage extends Component {
  constructor (...args) {
    super(...args);

    this.state = {
    };
  }

  DDInfo (label, data, props = {}) {
    return (
      <div {...props}>
        <div><b>{label}</b></div>
        <div style={{ paddingBottom: 20 }}>
          {Array.isArray(data) || isPlainObject(data)
            ? (
              <ReactJson enableClipboard={false} collapsed name={false} src={data} />
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
      </div>
    );
  }

  render () {
    /*eslint-disable react/jsx-handler-names*/
    return (
      <FieldSet debug {...this.props}>
        {({ value, hasException, ...other }) => (
          <div>
            <ErrorBlock hasException={hasException} error={other.error} valid={other.valid} />

            <div style={{ overflow: 'hidden' }}>
              {this.DDInfo('Main value', value, { style: { float: 'left', width: '48%' } })}
              {this.DDInfo('Main other', omitControl(other), { style: { float: 'right', width: '48%' } })}
            </div>

            <button type="button" onClick={other.triggerSubmit}>Submit!</button>

            <div style={{ overflow: 'hidden', padding: 20 }}>
              <div style={{ float: 'left', width: '48%' }}>
                <Field name="main_radio" id="main_radio">
                  {({ value, hasException, ...other }) => (
                    <div>
                      {this.DDInfo('[main_radio] 1 (related):', value)}
                      <FieldRadio hasException={hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                      <FieldRadio hasException={hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                      <FieldRadio hasException={hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                    </div>
                  )}
                </Field>

                <br />
                <br />

                <Field name="main_radio" id="main_radio">
                  {({ value, error, hasException, ...other }) => (
                    <div>
                      {this.DDInfo('[main_radio] 2 (related):', value)}
                      <FieldRadio hasException={hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                      <FieldRadio hasException={hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                      <FieldRadio hasException={hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                    </div>
                  )}
                </Field>

                <br />
                <br />

                <FieldSet name="nested_fields" validate={() => value && value.main_radio === 'some-1' ? undefined : 'main_radio must be "some-1" only!'}>
                  {({ value, error, valid, hasException }) => (
                    <div>
                      {this.DDInfo('[nested_fields]:', value)}

                      <ErrorBlock hasException={hasException} valid={valid} error={error} />

                      <div style={{ paddingLeft: 30 }}>
                        <Field name="nested_field_text">
                          {({ control, value, hasException, ...other }) => (
                            <div>
                              {this.DDInfo('[nested_field_text]:', value)}
                              <FieldInput hasException={hasException} valid={other.valid} error={other.error} {...control} />
                            </div>
                          )}
                        </Field>

                        <br />
                        <br />

                        <Field name="nested_field_bool">
                          {({ control, value, hasException, ...other }) => (
                            <div>
                              {this.DDInfo('[nested_field_bool]:', value)}
                              <FieldCheckBox hasException={hasException} valid={other.valid} error={other.error} {...control} checked={Boolean(value)}>nested_field_bool</FieldCheckBox>
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>
                  )}
                </FieldSet>
              </div>

              <div style={{ float: 'right', width: '48%' }}>
                <Field
                  name="price"
                  validate={[ required(), numberGTE(3) ]}
                  normalize={composeFilter(priceRemove('USD'), toFloat())}
                  format={composeFilter(defaults(0, false), toFixed(2), priceAdd('USD'))}
                >
                  {({ control, value, error, valid, hasException, $state }) => (
                    <div>
                      {this.DDInfo('[price]:', value)}
                      <FieldInput hasException={hasException} valid={valid} error={error} {...control} />
                    </div>
                  )}
                </Field>

                <br />
                <br />

                <Field
                  name="price2"
                  validate={[ required(), numberGTE(3) ]}
                >
                  {({ triggerChange }) => (
                    <Field
                      onChange={() => triggerChange()}
                      validate={[ (value) => patternFloat()(priceRemove('USD')(value)) ]}
                      normalize={composeFilter(priceRemove('USD'), toFloat())}
                      format={composeFilter(defaults(0, false), toFixed(2), priceAdd('USD'))}
                    >
                      {({ control, value, error, valid, hasException, $state }) => (
                        <div>
                          {this.DDInfo('price2:', value)}
                          <FieldInput hasException={hasException} valid={valid} error={error} {...control} />
                        </div>
                      )}
                    </Field>
                  )}
                </Field>

                <br />
                <br />

                <FieldList name="array_fields">
                  {({ triggerChange, value, error, hasException, valid, $state, items }) => (
                    <div style={{ paddingLeft: 10, paddingRight: 10, border: '1px solid #aaa' }}>
                      {this.DDInfo('[array_fields]:', value)}

                      <ErrorBlock hasException={hasException} valid={valid} error={error} />

                      <div>
                        {items.map((item, index) => {
                          const listValue = value;
                          const listOnChange = triggerChange;

                          return (
                            <FieldSet key={index} name={index}>
                              {({ value, valid, error, hasException, $state }) => (
                                <div style={{ padding: 10, marginLeft: 30, border: '1px solid #777', marginTop: 10, marginBottom: 10 }}>
                                  {this.DDInfo(`array_fields[${index}]:`, value)}

                                  <ErrorBlock hasException={hasException} valid={valid} error={error} />

                                  <div style={{ marginLeft: 50 }}>
                                    <Field name="array_fields_item_number" format={parseFloat} normalize={parseFloat} validate={required()}>
                                      {({ control, value, valid, error, hasException, $state }) => (
                                        <div>
                                          {this.DDInfo(`array_fields[${index}].array_fields_item_number:`, value)}
                                          <FieldInput hasException={hasException} valid={valid} error={error} type="number" {...control} />
                                        </div>
                                      )}
                                    </Field>
                                    <Field name="array_fields_item_text">
                                      {({ control, value, valid, error, hasException, $state }) => (
                                        <div>
                                          {this.DDInfo(`array_fields[${index}].array_fields_item_text:`, value)}
                                          <FieldInput hasException={hasException} valid={valid} error={error} {...control} />
                                        </div>
                                      )}
                                    </Field>
                                  </div>

                                  <button onClick={() => items.remove(index)}>remove this</button>
                                </div>
                              )}
                            </FieldSet>
                          );
                        })}
                        <br />
                        <button onClick={() => items.append({ array_fields_item_number: value && value.length ? 0 : undefined, array_fields_item_text: 'param pam pam' })}>Add one</button>
                      </div>
                    </div>
                  )}
                </FieldList>
              </div>
            </div>
          </div>
        )}
      </FieldSet>
    );
  }
};

const el = window.document.createElement('div');

window.document.body.appendChild(el);

render(
  <div style={{ fontSize: 12, fontFamily: 'monospace' }}>
    <ExampleBasicUsage />
  </div>,
  el
);
