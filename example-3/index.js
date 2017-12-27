/* eslint-disable react/prop-types, react/jsx-no-bind, react/no-array-index-key, jsx-a11y/label-has-for */
import React, { Component } from 'react';
import { render } from 'react-dom';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import isNaN from 'lodash/isNaN';
import isPlainObject from 'lodash/isPlainObject';
import ReactJson from 'react-json-view';
import { FieldSet, FieldList, FieldBoolean, FieldNumber, FieldString } from '../lib';



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

const initialValue = {
  main_radio: 'some-1',
  nested_fields: {
    nested_field_bool: true
  },
  value: 33,
  price: 23,
  array_fields: [
    {
      counter: 0,
      array_fields_item_number: 0,
      array_fields_item_text: 'param pam pam 0'
    }
  ]
};

const PERFORMANCE_TEST = false;
const DEBUG = false;

const DDInfo = ({ label, data, open = false }) => {
  const id = label.replace(/[^a-zA-Z0-9_]+/g, '_');

  if (PERFORMANCE_TEST) {
    return (
      <noscript />
    );
  }

  return (
    <div id={id} className="dd-info">
      {!open && (
        <style>
          {`#${id} { position: relative; cursor: pointer; } #${id} > .dd-info__in { display: none; z-index: 999; padding: 10px; border: 1px solid rgba(0,0,0,0.5); box-shadow: 0 2px 10px rgba(0,0,0,0.5); background: white; position: absolute; top: 100%; left: 0; }#${id}:hover > .dd-info__in { display: block; }`}
        </style>
      )}
      <div><b>{label}</b></div>
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
    </div>
  );
};

const ExampleBasicUsage = class ExampleBasicUsage extends Component {
  constructor (...args) {
    super(...args);

    this.state = {
    };
  }

  render () {
    /*eslint-disable react/jsx-handler-names*/
    return (
      <FieldSet debug={DEBUG} initialValue={initialValue} {...this.props}>
        {({ value, $state, $field, ...other }) => (
          <form onSubmit={other.triggerSubmit}>
            <ErrorBlock hasException={other.hasException} error={other.error} valid={other.valid} />

            <div>
              <div style={{ float: 'left', width: '48%' }}>
                <DDInfo label="FORM value" data={value} open />
              </div>
              <div style={{ float: 'right', width: '48%' }}>
                <DDInfo label="FORM meta" data={other} />
                <DDInfo label="FORM $state" data={$state} />
                <DDInfo label="FORM $field" data={$field} />
              </div>
              <div style={{ clear: 'both' }} />
            </div>

            <button type="button" onClick={other.triggerSubmit}>Submit!</button>

            <div style={{ padding: 20 }}>
              <div style={{ float: 'left', width: '48%' }}>
                <FieldString name="main_radio" id="main_radio">
                  {({ value, $state, $field, ...other }) => (
                    <Wrapper>
                      <DDInfo label="[main_radio] 1 (related)" data={value} open />
                      <DDInfo label="meta" data={other} />
                      <DDInfo label="$field" data={$field} />
                      <DDInfo label="$state" data={$state} />
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                    </Wrapper>
                  )}
                </FieldString>

                <br />
                <br />

                <FieldString name="main_radio" id="main_radio">
                  {({ value, $state, $field, ...other }) => (
                    <Wrapper>
                      <DDInfo label="[main_radio] 2 (related)" data={value} open />
                      <DDInfo label="meta" data={other} />
                      <DDInfo label="$field" data={$field} />
                      <DDInfo label="$state" data={$state} />
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                      <FieldRadio hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} checked={other.control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                    </Wrapper>
                  )}
                </FieldString>

                <br />
                <br />

                <FieldSet name="nested_fields" validate={() => value && value.main_radio === 'some-1' ? undefined : 'main_radio must be "some-1" only!'}>
                  {({ value, $state, $field, ...other }) => (
                    <Wrapper>
                      <DDInfo label="[nested_fields]" data={value} open />
                      <DDInfo label="meta" data={other} />
                      <DDInfo label="$field" data={$field} />
                      <DDInfo label="$state" data={$state} />

                      <ErrorBlock hasException={other.hasException} valid={other.valid} error={other.error} />

                      <div>
                        <FieldString preferState name="nested_field_text">
                          {({ $state, $field, value, ...other }) => (
                            <Wrapper>
                              <DDInfo label="[nested_field_text]" data={value} open />
                              <DDInfo label="meta" data={other} />
                              <DDInfo label="$field" data={$field} />
                              <DDInfo label="$state" data={$state} />
                              <FieldInput hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} />
                            </Wrapper>
                          )}
                        </FieldString>

                        <br />
                        <br />

                        <FieldBoolean name="nested_field_bool">
                          {({ control, value, ...other }) => (
                            <Wrapper>
                              <DDInfo label="[nested_field_bool]" data={value} open />
                              <DDInfo label="meta" data={other} />
                              <DDInfo label="$field" data={$field} />
                              <DDInfo label="$state" data={$state} />
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
                <FieldNumber
                  name="value"
                  validate={[ required(), numberGTE(3) ]}
                  normalize={toFloat()}
                >
                  {({ value, $state, $field, ...other }) => (
                    <Wrapper>
                      <DDInfo label="[value]" data={value} open />
                      <DDInfo label="meta" data={other} />
                      <DDInfo label="$field" data={$field} />
                      <DDInfo label="$state" data={$state} />
                      <FieldInput hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} />
                    </Wrapper>
                  )}
                </FieldNumber>

                <br />
                <br />

                <FieldNumber
                  name="price"
                  validate={[ required(), numberGTE(3) ]}
                >
                  {({ $state, $field, value, ...other }) => (
                    <Wrapper>
                      <DDInfo label="price" data={value} open />
                      <DDInfo label="meta" data={other} />
                      <DDInfo label="$field" data={$field} />
                      <DDInfo label="$state" data={$state} />
                      <ErrorBlock hasException={other.hasException} valid={other.valid} error={other.error} />
                      <FieldNumber
                        preferState
                        onChange={(value) => other.triggerChange(value)}
                        validate={[ (value) => patternFloat()(priceRemove('USD')(value)) ]}
                        normalize={composeFilter(priceRemove('USD'), toFloat())}
                        format={composeFilter(toFixed(2), priceAdd('USD'))}
                      >
                        {({ value, $state, $field, ...other }) => (
                          <Wrapper>
                            <DDInfo label="price2 INNER" data={value} open />
                            <DDInfo label="meta" data={other} />
                            <DDInfo label="$field" data={$field} />
                            <DDInfo label="$state" data={$state} />
                            <FieldInput hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} />
                          </Wrapper>
                        )}
                      </FieldNumber>
                    </Wrapper>
                  )}
                </FieldNumber>

                <br />
                <br />

                <FieldList name="array_fields">
                  {({ value, $state, $field, ...listOther }) => (
                    <Wrapper>
                      <DDInfo label="array_fields" data={value} open />
                      <DDInfo label="meta" data={listOther} />
                      <DDInfo label="$field" data={$field} />
                      <DDInfo label="$state" data={$state} />

                      <ErrorBlock hasException={listOther.hasException} valid={listOther.valid} error={listOther.error} />

                      {listOther.items.map((item, index) => (
                        <FieldSet key={index} name={index}>
                          {({ value, $state, $field, ...itemOther }) => (
                            <Wrapper>
                              <DDInfo label={`array_fields[${index}]`} data={value} open />
                              <DDInfo label="meta" data={listOther} />
                              <DDInfo label="$field" data={$field} />
                              <DDInfo label="$state" data={$state} />

                              <ErrorBlock hasException={itemOther.hasException} valid={itemOther.valid} error={itemOther.error} />

                              <div>
                                <FieldNumber name="array_fields_item_number" format={(value) => isNaN(parseFloat(value)) ? '' : parseFloat(value)} normalize={(value) => isNaN(parseFloat(value)) ? undefined : parseFloat(value)} validate={required()}>
                                  {({ control, value, valid, error, hasException, $state }) => (
                                    <Wrapper>
                                      <DDInfo label={`array_fields[${index}].array_fields_item_number`} data={value} open />
                                      <FieldInput hasException={hasException} valid={valid} error={error} type="number" {...control} />
                                    </Wrapper>
                                  )}
                                </FieldNumber>

                                <FieldString name="array_fields_item_text">
                                  {({ control, value, valid, error, hasException, $state }) => (
                                    <Wrapper>
                                      <DDInfo label={`array_fields[${index}].array_fields_item_text`} data={value} open />
                                      <FieldInput hasException={hasException} valid={valid} error={error} {...control} />
                                    </Wrapper>
                                  )}
                                </FieldString>

                                <FieldNumber name="counter">
                                  {({ value }) => (
                                    <Wrapper>
                                      <DDInfo label={`array_fields[${index}].array_fields_item_text`} data={value} open />
                                    </Wrapper>
                                  )}
                                </FieldNumber>
                              </div>

                              <button type="button" onClick={() => listOther.removeItems(index)}>remove this</button>
                            </Wrapper>
                          )}
                        </FieldSet>
                      ))}
                      <br />
                      <button type="button" onClick={() => listOther.appendItems({ counter: listOther.items.length, array_fields_item_number: listOther.items.length || undefined, array_fields_item_text: `param pam pam ${listOther.items.length}` })}>Add one</button>
                    </Wrapper>
                  )}
                </FieldList>
              </div>
              <div style={{ clear: 'both' }} />
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
