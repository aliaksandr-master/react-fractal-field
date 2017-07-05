


const ExampleBasicUsage = () => (
  <FractalField {...props} isolated>
    {({ value, control, triggerSubmit, ...other }) => (
      <div>
        <div style={{ background: other.valid ? 'green' : 'red', height: 40, marginBottom: 40 }} />

        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left', width: '48%' }}>
            <Trace>{value}</Trace>
          </div>
          <div style={{ float: 'right', width: '48%' }}>
            <Trace>{other}</Trace>
          </div>
        </div>

        <button type="button" onClick={triggerSubmit}>Submit!</button>

        <div style={{ overflow: 'hidden', padding: 20 }}>
          <div style={{ float: 'left', width: '48%' }}>
            <FractalField name="main_radio">
              {({ control, value, name, error }) => (
                <div>
                  <Label>{name} (related)</Label>
                  <Trace>{value}</Trace>
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
                  <Trace>{value}</Trace>
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
                  <Trace>{value}</Trace>

                  <div style={{ paddingLeft: 30 }}>
                    <FractalField name="nested_field_text">
                      {({ control, value, name, error }) => (
                        <div>
                          <Label>{name}</Label>
                          <Trace>{value}</Trace>
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
                          <Trace>{value}</Trace>
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
                  <Trace>{$state}</Trace>
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
                  <Trace>{$state}</Trace>
                  <FieldInput {...control} checked={Boolean(value)} />
                  <ErrorFieldNotice message={error} />
                </div>
              )}
            </FractalField>

            <br />
            <br />

            <FractalField name="array_fields">
              {({ triggerChange, control, value, name, error, $state }) => (
                <div style={{ paddingLeft: 10, paddingRight: 10, border: '1px solid #aaa' }}>
                  <Label>{name}</Label>
                  <Trace>{$state}</Trace>
                  <div>
                    {(value || []).map((item, index) => {
                      const listValue = value;
                      const listOnChange = triggerChange;

                      return (
                        <FractalField key={index} name={`[${index}]`}>
                          {({ control, value, name, valid, error, $state }) => (
                            <div style={{ padding: 10, marginLeft: 30, border: '1px solid #777', marginTop: 10, marginBottom: 10 }}>
                              <Label>{name}</Label>
                              <Trace>{$state}</Trace>

                              <div style={{ marginLeft: 50 }}>
                                <FractalField name="array_fields_item_number" format={parseFloat} normalize={parseFloat}>
                                  {({ control, value, name, valid, error, $state }) => (
                                    <div>
                                      <Label>{name}</Label>
                                      <Trace>{$state}</Trace>
                                      <FieldInput type="number" {...control} />
                                      <ErrorFieldNotice message={error} />
                                    </div>
                                  )}
                                </FractalField>
                                <FractalField name="array_fields_item_text">
                                  {({ control, value, name, error, $state }) => (
                                    <div>
                                      <Label>{name}</Label>
                                      <Trace>{$state}</Trace>
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
