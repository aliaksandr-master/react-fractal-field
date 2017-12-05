/* eslint-disable react/prop-types, react/jsx-no-bind, react/no-array-index-key, jsx-a11y/label-has-for */
import React, { Component } from 'react';
import { render } from 'react-dom';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import isNaN from 'lodash/isNaN';
import isPlainObject from 'lodash/isPlainObject';
import ReactJson from 'react-json-view';
import FractalField from '../lib';



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
const ErrorBlock = ({ children, valid, error, style = {} }) => {
  valid = !error && valid;

  return (
    <div>
      <div style={{ background: !valid ? 'red' : 'green', padding: 2, minHeight: 20, ...style }}>
        {children || (<div style={{ lineHeight: '20px', color: 'white', textAlign: 'center' }}>{!valid ? 'INVALID' : 'VALID'}</div>)}
      </div>
      {error && (
        <div style={{ color: 'red' }}>
          error: {Array.isArray(error) ? error[0] : error}
        </div>
      )}
    </div>
  );
};

const FieldRadio = ({ valid, error, children, ...props }) => (
  <ErrorBlock error={error} valid={valid}>
    <label>
      <input {...props} type="radio" />
      {children}
    </label>
  </ErrorBlock>
);

const FieldInput = ({ error, valid, ...props }) => (
  <ErrorBlock error={error} valid={valid}>
    <input type="text" {...props} />
  </ErrorBlock>
);

const FieldCheckBox = ({ error, valid, children, ...props }) => (
  <ErrorBlock error={error} valid={valid}>
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
      <FractalField {...this.props}>
        {({ value, ...other }) => (
          <div>
            <ErrorBlock error={other.error} valid={other.valid} />

            <div style={{ overflow: 'hidden' }}>
              {this.DDInfo('Main value', value, { style: { float: 'left', width: '48%' } })}
              {this.DDInfo('Main other', omitControl(other), { style: { float: 'right', width: '48%' } })}
            </div>

            <button type="button" onClick={other.triggerSubmit}>Submit!</button>

            <div style={{ overflow: 'hidden', padding: 20 }}>
              <div style={{ float: 'left', width: '48%' }}>
                <FractalField name="main_radio">
                  {({ value, ...other }) => (
                    <div>
                      {this.DDInfo('[main_radio] 1 (related):', value)}
                      <FieldRadio valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                      <FieldRadio valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                      <FieldRadio valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                    </div>
                  )}
                </FractalField>

                <br />
                <br />

                <FractalField name="main_radio">
                  {({ value, error, ...other }) => (
                    <div>
                      {this.DDInfo('[main_radio] 2 (related):', value)}
                      <FieldRadio valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                      <FieldRadio valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                      <FieldRadio valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                    </div>
                  )}
                </FractalField>

                <br />
                <br />

                <FractalField name="nested_fields" validate={() => value.main_radio === 'some-1' ? undefined : 'main_radio must be "some-1" only!'}>
                  {({ value, error, valid }) => (
                    <div>
                      {this.DDInfo('[nested_fields]:', value)}

                      <ErrorBlock valid={valid} error={error} />

                      <div style={{ paddingLeft: 30 }}>
                        <FractalField name="nested_field_text">
                          {({ control, value, ...other }) => (
                            <div>
                              {this.DDInfo('[nested_field_text]:', value)}
                              <FieldInput valid={other.valid} error={other.error} {...control} />
                            </div>
                          )}
                        </FractalField>

                        <br />
                        <br />

                        <FractalField name="nested_field_bool">
                          {({ control, value, ...other }) => (
                            <div>
                              {this.DDInfo('[nested_field_bool]:', value)}
                              <FieldCheckBox valid={other.valid} error={other.error} {...control} checked={Boolean(value)}>nested_field_bool</FieldCheckBox>
                            </div>
                          )}
                        </FractalField>
                      </div>
                    </div>
                  )}
                </FractalField>
              </div>

              <div style={{ float: 'right', width: '48%' }}>
                <FractalField
                  name="price"
                  validate={[ required(), numberGTE(3) ]}
                  normalize={composeFilter(priceRemove('USD'), toFloat())}
                  format={composeFilter(defaults(0, false), toFixed(2), priceAdd('USD'))}
                  preFormat={composeFilter(priceAdd('USD'))}
                  preValidate={[ (value) => patternFloat()(priceRemove('USD')(value)) ]}
                >
                  {({ control, value, error, valid, $state }) => (
                    <div>
                      {this.DDInfo('[price]:', value)}
                      <FieldInput valid={valid} error={error} {...control} />
                    </div>
                  )}
                </FractalField>

                <br />
                <br />

                <FractalField
                  name="price2"
                  validate={[ required(), numberGTE(3) ]}
                  normalize={composeFilter(priceRemove('USD'), toFloat())}
                  format={composeFilter(defaults(0, false), toFixed(2), priceAdd('USD'))}
                  preFormat={composeFilter(priceAdd('USD'))}
                  preNormalize={composeFilter(priceRemove('USD'))}
                  preValidate={[ (value) => patternFloat()(priceRemove('USD')(value)) ]}
                >
                  {({ control, value, error, valid, $state }) => (
                    <div>
                      {this.DDInfo('price2:', value)}
                      <FieldInput valid={valid} error={error} {...control} />
                    </div>
                  )}
                </FractalField>

                <br />
                <br />

                <FractalField name="array_fields">
                  {({ triggerChange, value, error, valid, $state }) => (
                    <div style={{ paddingLeft: 10, paddingRight: 10, border: '1px solid #aaa' }}>
                      {this.DDInfo('[array_fields]:', value)}

                      <ErrorBlock valid={valid} error={error} />

                      <div>
                        {(value || []).map((item, index) => {
                          const listValue = value;
                          const listOnChange = triggerChange;

                          return (
                            <FractalField key={index} name={`[${index}]`}>
                              {({ value, valid, error, $state }) => (
                                <div style={{ padding: 10, marginLeft: 30, border: '1px solid #777', marginTop: 10, marginBottom: 10 }}>
                                  {this.DDInfo(`array_fields[${index}]:`, value)}

                                  <ErrorBlock valid={valid} error={error} />

                                  <div style={{ marginLeft: 50 }}>
                                    <FractalField name="array_fields_item_number" format={parseFloat} normalize={parseFloat} validate={required()}>
                                      {({ control, value, valid, error, $state }) => (
                                        <div>
                                          {this.DDInfo(`array_fields[${index}].array_fields_item_number:`, value)}
                                          <FieldInput valid={valid} error={error} type="number" {...control} />
                                        </div>
                                      )}
                                    </FractalField>
                                    <FractalField name="array_fields_item_text">
                                      {({ control, value, valid, error, $state }) => (
                                        <div>
                                          {this.DDInfo(`array_fields[${index}].array_fields_item_text:`, value)}
                                          <FieldInput valid={valid} error={error} {...control} />
                                        </div>
                                      )}
                                    </FractalField>
                                  </div>

                                  <button onClick={() => listOnChange(listValue.filter((v, i) => i !== index))}>remove this</button>
                                </div>
                              )}
                            </FractalField>
                          );
                        })}
                        <br />
                        <button onClick={() => triggerChange([ ...(value || []), { array_fields_item_number: value && value.length ? 0 : undefined, array_fields_item_text: 'param pam pam' } ])}>Add one</button>
                      </div>
                    </div>
                  )}
                </FractalField>
              </div>
            </div>
          </div>
        )}
      </FractalField>
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
