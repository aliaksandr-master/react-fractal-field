/* eslint-disable react/prop-types, react/jsx-no-bind, react/no-array-index-key, jsx-a11y/label-has-for */
import React, { Component } from 'react';
import { render } from 'react-dom';
import { FieldSet, FieldList, FieldBoolean, FieldNumber, FieldString } from '../lib';
import { Wrapper, composeFilter, ErrorBlock, FieldCheckBox, FieldInput, FieldRadio, Info, numberGTE, patternFloat, priceAdd, priceRemove, required, toFixed, toFloat } from '../examples/utils';


// filters
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

const DEBUG = true;

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
                <Info label="FORM value" data={value} open />
              </div>
              <div style={{ float: 'right', width: '48%' }}>
                <Info label="FORM meta" data={other} open />
                <Info label="FORM $state" data={$state} />
                <Info label="FORM $field" data={$field} />
              </div>
              <div style={{ clear: 'both' }} />
            </div>

            <button type="button" onClick={other.triggerSubmit}>Submit!</button>

            <div style={{ padding: 20 }}>
              <div style={{ float: 'left', width: '48%' }}>
                <FieldString name="main_radio" id="main_radio">
                  {({ value, $state, $field, ...other }) => (
                    <Wrapper>
                      <Info label="[main_radio] 1 (related)" data={value} open />
                      <Info label="meta" data={other} />
                      <Info label="$field" data={$field} />
                      <Info label="$state" data={$state} />
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
                      <Info label="[main_radio] 2 (related)" data={value} open />
                      <Info label="meta" data={other} />
                      <Info label="$field" data={$field} />
                      <Info label="$state" data={$state} />
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
                      <Info label="[nested_fields]" data={value} open />
                      <Info label="meta" data={other} />
                      <Info label="$field" data={$field} />
                      <Info label="$state" data={$state} />

                      <ErrorBlock hasException={other.hasException} valid={other.valid} error={other.error} />

                      <div>
                        <FieldString preferState name="nested_field_text">
                          {({ $state, $field, value, ...other }) => (
                            <Wrapper>
                              <Info label="[nested_field_text]" data={value} open />
                              <Info label="meta" data={other} />
                              <Info label="$field" data={$field} />
                              <Info label="$state" data={$state} />
                              <FieldInput hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} />
                            </Wrapper>
                          )}
                        </FieldString>

                        <br />
                        <br />

                        <FieldBoolean name="nested_field_bool">
                          {({ control, value, ...other }) => (
                            <Wrapper>
                              <Info label="[nested_field_bool]" data={value} open />
                              <Info label="meta" data={other} />
                              <Info label="$field" data={$field} />
                              <Info label="$state" data={$state} />
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
                      <Info label="[value]" data={value} open />
                      <Info label="meta" data={other} />
                      <Info label="$field" data={$field} />
                      <Info label="$state" data={$state} />
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
                      <Info label="price" data={value} open />
                      <Info label="meta" data={other} />
                      <Info label="$field" data={$field} />
                      <Info label="$state" data={$state} />
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
                            <Info label="price2 INNER" data={value} open />
                            <Info label="meta" data={other} />
                            <Info label="$field" data={$field} />
                            <Info label="$state" data={$state} />
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
                      <Info label="array_fields" data={value} open />
                      <Info label="meta" data={listOther} />
                      <Info label="$field" data={$field} />
                      <Info label="$state" data={$state} />

                      <ErrorBlock hasException={listOther.hasException} valid={listOther.valid} error={listOther.error} />

                      {listOther.items.map((item, index) => (
                        <FieldSet key={index} name={index}>
                          {({ value, $state, $field, ...itemOther }) => (
                            <Wrapper>
                              <Info label={`array_fields[${index}]`} data={value} open />
                              <Info label="meta" data={listOther} />
                              <Info label="$field" data={$field} />
                              <Info label="$state" data={$state} />

                              <ErrorBlock hasException={itemOther.hasException} valid={itemOther.valid} error={itemOther.error} />

                              <div>
                                <FieldNumber name="array_fields_item_number" format={(value) => isNaN(parseFloat(value)) ? '' : parseFloat(value)} normalize={(value) => isNaN(parseFloat(value)) ? undefined : parseFloat(value)} validate={required()}>
                                  {({ control, value, valid, error, hasException, $state }) => (
                                    <Wrapper>
                                      <Info label={`array_fields[${index}].array_fields_item_number`} data={value} open />
                                      <FieldInput hasException={hasException} valid={valid} error={error} type="number" {...control} />
                                    </Wrapper>
                                  )}
                                </FieldNumber>

                                <FieldString name="array_fields_item_text">
                                  {({ control, value, valid, error, hasException, $state }) => (
                                    <Wrapper>
                                      <Info label={`array_fields[${index}].array_fields_item_text`} data={value} open />
                                      <FieldInput hasException={hasException} valid={valid} error={error} {...control} />
                                    </Wrapper>
                                  )}
                                </FieldString>

                                <FieldNumber name="counter">
                                  {({ value }) => (
                                    <Wrapper>
                                      <Info label={`array_fields[${index}].array_fields_item_text`} data={value} open />
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
