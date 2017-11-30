/* eslint-disable react/prop-types, react/jsx-no-bind, react/no-array-index-key, jsx-a11y/label-has-for */
import React from 'react';
import { render } from 'react-dom';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import FractalField from '../lib';



const required = () => (value) => value ? null : 'required';
const numberGTE = (max) => (value) => isNumber(value) && value >= max ? null : 'invalid max';
const composeFilter = (...filters) => (value) => filters.reduce((value, filter) => filter(value), value);
const toFloat = () => (value) => isNumber(value) ? value : parseFloat(value);
const toFixed = (accuracy) => (value) => {
  if (isNumber(value)) {
    return value.toFixed(accuracy);
  }

  throw new Error('invalid');
};

const priceRemove = (currency) => (value) => {
  return String(value).replace(`${currency} `, '');
};

const priceAdd = (currency) => (value) => {
  return `${currency} ${value}`;
};


const FieldRadio = ({ children, ...props }) => (
  <label>
    <input {...props} type="radio" />
    {children}
  </label>
);

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


const Label = ({ children, ...props }) => (
  <div {...props}><b>{children}</b></div>
);

const ErrorFieldNotice = ({ message }) => (
  <div style={{ color: 'red' }}>
    {Array.isArray(message) ? message[0] : message}
  </div>
);

const FieldInput = () => (
  <input type="text" />
);

const FieldCheckBox = ({ children, ...props }) => (
  <label>
    <input {...props} type="checkbox" />
    {children}
  </label>
);

const patternFloat = () => (value) => {

};


const ExampleBasicUsage = (props) => (
  <FractalField {...props} isolated>
    {({ value, triggerSubmit, control, ...other }) => (
      <div>
        <div style={{ background: other.valid ? 'green' : 'red', height: 40, marginBottom: 40 }} />

        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left', width: '48%' }}>
            <pre>{JSON.stringify(value, null, 4)}</pre>
          </div>
          <div style={{ float: 'right', width: '48%' }}>
            <pre>{JSON.stringify(other, null, 4)}</pre>
          </div>
        </div>

        <button type="button" onClick={triggerSubmit}>Submit!</button>

        <div style={{ overflow: 'hidden', padding: 20 }}>
          <div style={{ float: 'left', width: '48%' }}>
            <FractalField name="main_radio">
              {({ control, value, name, error }) => (
                <div>
                  <Label>{name} (related)</Label>
                  <pre>{JSON.stringify(value, null, 4)}</pre>
                  <FieldRadio {...control} checked={control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                  <FieldRadio {...control} checked={control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                  <FieldRadio {...control} checked={control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                  <ErrorFieldNotice message={error} />
                </div>
              )}
            </FractalField>

            <br />
            <br />
            <FractalField name="main_radio">
              {({ control, value, name, error }) => (
                <div>
                  <Label>{name} (related)</Label>
                  <pre>{JSON.stringify(value, null, 4)}</pre>
                  <FieldRadio {...control} checked={control.value === 'some-1'} value="some-1">Some 1</FieldRadio>
                  <FieldRadio {...control} checked={control.value === 'some-2'} value="some-2">Some 2</FieldRadio>
                  <FieldRadio {...control} checked={control.value === 'some-3'} value="some-3">Some 3</FieldRadio>
                  <ErrorFieldNotice message={error} />
                </div>
              )}
            </FractalField>

            <br />
            <br />
            <FractalField name="nested_fields" validate={() => value.main_radio === 'some-1' ? undefined : 'main_radio must be "some-1" only!'}>
              {({ value, name, error }) => (
                <div>
                  <Label>{name}</Label>
                  <pre>{JSON.stringify(value, null, 4)}</pre>

                  <div style={{ paddingLeft: 30 }}>
                    <FractalField name="nested_field_text">
                      {({ control, value, name, error }) => (
                        <div>
                          <Label>{name}</Label>
                          <pre>{JSON.stringify(value, null, 4)}</pre>
                          <FieldInput {...control} />
                          <ErrorFieldNotice message={error} />
                        </div>
                      )}
                    </FractalField>
                    <br />
                    <br />
                    <FractalField name="nested_field_bool">
                      {({ control, value, name, error }) => (
                        <div>
                          <Label>{name}</Label>
                          <pre>{JSON.stringify(value, null, 4)}</pre>
                          <FieldCheckBox {...control} checked={Boolean(value)}>{name}</FieldCheckBox>
                          <ErrorFieldNotice message={error} />
                        </div>
                      )}
                    </FractalField>
                  </div>
                  <ErrorFieldNotice message={error} />
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
              {({ control, value, name, error, $state }) => (
                <div>
                  <Label>{name}</Label>
                  <pre>{JSON.stringify($state, null, 4)}</pre>
                  <FieldInput {...control} checked={Boolean(value)} />
                  <ErrorFieldNotice message={error} />
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
              {({ control, value, name, error, $state }) => (
                <div>
                  <Label>{name}</Label>
                  <pre>{JSON.stringify($state, null, 4)}</pre>
                  <FieldInput {...control} checked={Boolean(value)} />
                  <ErrorFieldNotice message={error} />
                </div>
              )}
            </FractalField>

            <br />
            <br />

            <FractalField name="array_fields">
              {({ triggerChange, value, name, error, $state }) => (
                <div style={{ paddingLeft: 10, paddingRight: 10, border: '1px solid #aaa' }}>
                  <Label>{name}</Label>
                  <pre>{JSON.stringify($state, null, 4)}</pre>
                  <div>
                    {(value || []).map((item, index) => {
                      const listValue = value;
                      const listOnChange = triggerChange;

                      return (
                        <FractalField key={index} name={`[${index}]`}>
                          {({ value, name, valid, error, $state }) => (
                            <div style={{ padding: 10, marginLeft: 30, border: '1px solid #777', marginTop: 10, marginBottom: 10 }}>
                              <Label>{name}</Label>
                              <pre>{JSON.stringify($state, null, 4)}</pre>

                              <div style={{ marginLeft: 50 }}>
                                <FractalField name="array_fields_item_number" format={parseFloat} normalize={parseFloat}>
                                  {({ control, value, name, valid, error, $state }) => (
                                    <div>
                                      <Label>{name}</Label>
                                      <pre>{JSON.stringify($state, null, 4)}</pre>
                                      <FieldInput type="number" {...control} />
                                      <ErrorFieldNotice message={error} />
                                    </div>
                                  )}
                                </FractalField>
                                <FractalField name="array_fields_item_text">
                                  {({ control, value, name, error, $state }) => (
                                    <div>
                                      <Label>{name}</Label>
                                      <pre>{JSON.stringify($state, null, 4)}</pre>
                                      <FieldInput {...control} />
                                      <ErrorFieldNotice message={error} />
                                    </div>
                                  )}
                                </FractalField>
                              </div>
                              <ErrorFieldNotice message={error} />

                              <button onClick={() => listOnChange(listValue.filter((v, i) => i !== index))}>remove this</button>
                            </div>
                          )}
                        </FractalField>
                      );
                    })}
                    <br />
                    <ErrorFieldNotice message={error} />
                    <button onClick={() => triggerChange([ ...(value || []), { array_fields_item_number: 3, array_fields_item_text: 'param pam pam' } ])}>Add one</button>
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

const el = window.document.createElement('div');

window.document.body.appendChild(el);

render(
  <div style={{ fontSize: 10, fontFamily: 'monospace' }}>
    <ExampleBasicUsage />
  </div>,
  el
);
