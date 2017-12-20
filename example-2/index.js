/* eslint-disable react/prop-types, react/jsx-no-bind, react/no-array-index-key, jsx-a11y/label-has-for */
import React, { Component } from 'react';
import { render } from 'react-dom';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import isNaN from 'lodash/isNaN';
import isPlainObject from 'lodash/isPlainObject';
import ReactJson from 'react-json-view';
import { Field, FieldSet, FieldList, FieldBoolean, FieldNumber, FieldString } from '../lib';



// filters
const composeFilter = (...filters) => (value) => filters.reduce((result, filter) => filter(result), value);

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

const toFloat = () => (value) => {
  if (isNumber(value)) {
    return value;
  }

  const number = parseFloat(String(value || ''));

  if (isNaN(number)) {
    return 0;
  }

  return number;
};

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


const Wrapper = ({ children }) => (
  <div style={{ border: '1px solid #aaa', padding: '10px', margin: '20px 0' }}>{children}</div>
);


// components
const ErrorBlock = ({ children, valid, error, hasException, style = {} }) => {
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

  DDInfo (label, data, open = false) {
    return (
      <div>
        <div><b>{label}</b></div>
        <div style={{ paddingBottom: 20 }}>
          {Array.isArray(data) || isPlainObject(data)
            ? (
              <ReactJson enableClipboard={false} collapsed={!open} name={false} src={data} />
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
      <FieldSet {...this.props}>
        {({ value, $state, ...other }) => (
          <form onSubmit={other.triggerSubmit}>
            <ErrorBlock hasException={other.hasException} error={other.error} valid={other.valid} />

            <div style={{ overflow: 'hidden' }}>
              <div style={{ float: 'left', width: '48%' }}>
                {this.DDInfo('FORM value', value, true)}
              </div>
              <div style={{ float: 'right', width: '48%' }}>
                {this.DDInfo('FORM meta', other, true)}
                {this.DDInfo('FORM $state', $state)}
              </div>
            </div>

            <button type="button" onClick={other.triggerSubmit}>Submit!</button>

            <div style={{ overflow: 'hidden', padding: 20 }}>
              <div style={{ float: 'left', width: '48%' }}>
                <FieldString name="main_radio" id="main_radio">
                  {({ value, ...other }) => (
                    <Wrapper>
                      {this.DDInfo('[main_radio] 1 (related):', value)}
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                    </Wrapper>
                  )}
                </FieldString>

                <br />
                <br />

                <FieldString name="main_radio" id="main_radio">
                  {({ value, error, ...other }) => (
                    <Wrapper>
                      {this.DDInfo('[main_radio] 2 (related):', value)}
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                    </Wrapper>
                  )}
                </FieldString>

                <br />
                <br />

                <FieldSet name="nested_fields" validate={() => value && value.main_radio === 'some-1' ? undefined : 'main_radio must be "some-1" only!'}>
                  {({ value, error, valid, hasException }) => (
                    <Wrapper>
                      {this.DDInfo('[nested_fields]:', value)}

                      <ErrorBlock hasException={hasException} valid={valid} error={error} />

                      <div>
                        <Field preferState name="nested_field_text">
                          {({ control, value, hasException, ...other }) => (
                            <Wrapper>
                              {this.DDInfo('[nested_field_text]:', value)}
                              <FieldInput hasException={hasException} valid={other.valid} error={other.error} {...control} />
                            </Wrapper>
                          )}
                        </Field>

                        <br />
                        <br />

                        <FieldBoolean name="nested_field_bool">
                          {({ control, value, ...other }) => (
                            <Wrapper>
                              {this.DDInfo('[nested_field_bool]:', value)}
                              <FieldCheckBox hasException={other.hasException} valid={other.valid} error={other.error} {...control} checked={Boolean(value)}>nested_field_bool</FieldCheckBox>
                            </Wrapper>
                          )}
                        </FieldBoolean>
                      </div>
                    </Wrapper>
                  )}
                </FieldSet>
              </div>

              <div style={{ float: 'right', width: '48%' }}>
                <Field
                  name="value"
                  validate={[ required(), numberGTE(3) ]}
                  normalize={toFloat()}
                >
                  {({ control, value, error, valid, hasException, $state }) => (
                    <Wrapper>
                      {this.DDInfo('[value]:', value)}
                      <FieldInput hasException={hasException} valid={valid} error={error} {...control} />
                    </Wrapper>
                  )}
                </Field>

                <br />
                <br />

                <FieldNumber
                  name="price"
                  validate={[ required(), numberGTE(3) ]}
                >
                  {({ triggerChange, hasException, valid, error, value }) => (
                    <Wrapper>
                      {this.DDInfo('price2:', value)}
                      <ErrorBlock hasException={hasException} valid={valid} error={error} />
                      <Field
                        preferState
                        onChange={(value) => triggerChange(value)}
                        validate={[ (value) => patternFloat()(priceRemove('USD')(value)) ]}
                        normalize={composeFilter(priceRemove('USD'), toFloat())}
                        format={composeFilter(toFixed(2), priceAdd('USD'))}
                      >
                        {({ control, value, error, valid, hasException, $state }) => (
                          <Wrapper>
                            {this.DDInfo('price2 INNER:', value)}
                            <FieldInput hasException={hasException} valid={valid} error={error} {...control} />
                          </Wrapper>
                        )}
                      </Field>
                    </Wrapper>
                  )}
                </FieldNumber>

                <br />
                <br />

                <FieldList name="array_fields">
                  {({ triggerChange, value, error, hasException, valid, $state, items, appendItems, removeItems }) => (
                    <Wrapper>
                      {this.DDInfo('[array_fields]:', value, true)}

                      <ErrorBlock hasException={hasException} valid={valid} error={error} />

                      {items.map((item, index) => (
                        <FieldSet key={index} name={index}>
                          {({ value, valid, error, hasException, $state }) => (
                            <Wrapper>
                              {this.DDInfo(`array_fields[${index}]:`, value, true)}

                              <ErrorBlock hasException={hasException} valid={valid} error={error} />

                              <div>
                                <Field name="array_fields_item_number" format={(value) => isNaN(parseFloat(value)) ? '' : parseFloat(value)} normalize={(value) => isNaN(parseFloat(value)) ? undefined : parseFloat(value)} validate={required()}>
                                  {({ control, value, valid, error, hasException, $state }) => (
                                    <Wrapper>
                                      {this.DDInfo(`array_fields[${index}].array_fields_item_number:`, value)}
                                      <FieldInput hasException={hasException} valid={valid} error={error} type="number" {...control} />
                                    </Wrapper>
                                  )}
                                </Field>

                                <Field name="array_fields_item_text">
                                  {({ control, value, valid, error, hasException, $state }) => (
                                    <Wrapper>
                                      {this.DDInfo(`array_fields[${index}].array_fields_item_text:`, value)}
                                      <FieldInput hasException={hasException} valid={valid} error={error} {...control} />
                                    </Wrapper>
                                  )}
                                </Field>

                                <Field name="counter">
                                  {({ control, value, valid, error, hasException, $state }) => (
                                    <Wrapper>
                                      {this.DDInfo(`array_fields[${index}].array_fields_item_text:`, value)}
                                    </Wrapper>
                                  )}
                                </Field>
                              </div>

                              <button type="button" onClick={() => removeItems(index)}>remove this</button>
                            </Wrapper>
                          )}
                        </FieldSet>
                      ))}
                      <br />
                      <button type="button" onClick={() => appendItems({ counter: items.length, array_fields_item_number: items.length || undefined, array_fields_item_text: `param pam pam ${items.length}` })}>Add one</button>
                    </Wrapper>
                  )}
                </FieldList>
              </div>
            </div>
          </form>
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
