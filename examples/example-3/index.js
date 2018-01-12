/* eslint-disable react/prop-types, react/jsx-no-bind, react/no-array-index-key, jsx-a11y/label-has-for */
import React from 'react';
import { render } from 'react-dom';
import omit from 'lodash/omit';
import { FieldSet, FieldList, FieldBoolean, FieldNumber, FieldString } from '../../lib/index';
import { Wrapper, composeFilter, ErrorBlock, FieldCheckBox, FieldInput, FieldRadio, Info, numberGTE, patternFloat, priceAdd, priceRemove, required, toFixed, toFloat } from '../utils';


// filters
const initialValue = {
  main_radio: 'some-1',
  nested_fields: {
    nested_field_bool: true
  },
  dynamic_fields: {

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

const DEBUG = false;

let counter = 0;

const styles = {
  row: { padding: 20 },
  column1: { float: 'left', width: '48%' },
  column2: { float: 'right', width: '48%' },
  columnReset: { clear: 'both' }
};

const ExampleBasicUsage = (props) => {
  /*eslint-disable react/jsx-handler-names*/
  return (
    <FieldSet debug={DEBUG} initialValue={initialValue} {...props}>
      {({ value, $state, $field, ...other }) => (
        <form onSubmit={other.triggerSubmit}>
          <ErrorBlock hasException={other.hasException} error={other.error} valid={other.valid} />

          <div style={styles.row}>
            <div style={styles.column1}>
              <Info label="FORM value" data={value} open />
            </div>
            <div style={styles.column2}>
              <Info label="FORM meta" data={other} open />
              <Info label="FORM $state" data={$state} />
              <Info label="FORM $field" data={$field} />
            </div>
            <div style={styles.columnReset} />

            <button type="button" onClick={other.triggerSubmit}>Submit!</button>
          </div>

          <div style={styles.row}>
            <div style={styles.column1}>
              <div>
                <FieldSet name="dynamic_fields">
                  {({ value: dynamicFieldsValue, ...dynamicFieldsOther }) => (
                    <Wrapper>
                      <Info label="dynamic_fields" data={dynamicFieldsValue} open />
                      <Info label="meta" data={dynamicFieldsOther} />
                      <Info label="$field" data={$field} />
                      <Info label="$state" data={$state} />

                      {Object.keys(dynamicFieldsValue).sort().map((name) => ( // eslint-disable-line fp/no-mutating-methods
                        <FieldString name={name} key={name}>
                          {({ value, $state, $field, ...other }) => (
                            <Wrapper>
                              <Info label={name} data={value} open />
                              <Info label="meta" data={other} />
                              <Info label="$field" data={$field} />
                              <Info label="$state" data={$state} />
                              <FieldInput
                                hasException={other.hasException}
                                valid={other.valid}
                                error={other.error}
                                {...other.control}
                              />
                              <button type="button" onClick={() => dynamicFieldsOther.triggerChange(omit(dynamicFieldsValue, name))}>Remove</button>
                            </Wrapper>
                          )}
                        </FieldString>
                      ))}

                      <button type="button" onClick={() => dynamicFieldsOther.triggerChange({ ...dynamicFieldsValue, [`dynamic_field_${Object.keys(dynamicFieldsValue).length}_${++counter}`]: String(counter) })}>Add new dynamic field</button>
                    </Wrapper>
                  )}
                </FieldSet>
              </div>

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
                      <FieldString postponeInvalid name="nested_field_text">
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

            <div style={styles.column2}>
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

                    <FieldString
                      value={String(value)}
                      onChange={(val) => other.triggerChange(toFloat()(val))}
                      postponeInvalid
                      validate={patternFloat()}
                      normalize={priceRemove('USD')}
                      format={priceAdd('USD')}
                    >
                      {({ value, $state, $field, ...other }) => (
                        <Wrapper>
                          <Info label="price (INNER)" data={value} open />
                          <Info label="meta" data={other} />
                          <Info label="$field" data={$field} />
                          <Info label="$state" data={$state} />
                          <FieldInput hasException={other.hasException} valid={other.valid} error={other.error} {...other.control} />
                        </Wrapper>
                      )}
                    </FieldString>
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
            <div style={styles.columnReset} />
          </div>
        </form>
      )}
    </FieldSet>
  );
};

const el = window.document.createElement('div');

window.document.body.appendChild(el);

render(
  <div style={{ fontSize: 12, fontFamily: 'monospace' }}>
    <ExampleBasicUsage />
  </div>,
  el
);
