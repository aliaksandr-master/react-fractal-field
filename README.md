[![npm](http://img.shields.io/npm/v/react-fractal-field.svg?style=flat-square)](https://www.npmjs.com/package/react-fractal-field)
[![npm](http://img.shields.io/npm/l/react-fractal-field.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Dependency Status](https://david-dm.org/aliaksandr-master/react-fractal-field.svg?style=flat-square)](https://david-dm.org/aliaksandr-master/react-fractal-field)
[![devDependency Status](https://david-dm.org/aliaksandr-master/react-fractal-field/dev-status.svg?style=flat-square)](https://david-dm.org/aliaksandr-master/react-fractal-field#info=devDependencies)
[![peerDependency Status](https://david-dm.org/aliaksandr-master/react-fractal-field/peer-status.svg?style=flat-square)](https://david-dm.org/aliaksandr-master/react-fractal-field?type=peer)

# react-fractal-field

```shell
$ npm install prop-types lodash react react-fractal-field --save
```

## Usage

```javascript
import { Field, FieldSet } from 'react-fractal-field';

const MyComponent = ({ onSubmit }) => (
  <FieldSet onSubmit={onSubmit} isolated>
    {({ triggerSubmit }) => (
      <div>
        <Field name="value">
          {({ control }) => (
            <div>
              <input {...control} type="text" />
            </div>
          )}
        </Field>
        <button onClick={triggerSubmit}>Submit</button>
      </div>
    )}
  </FieldSet>
)
```

## API

### common FieldSet/FieldList/Field `props`:
- `id`: [ String, Number ] - ID used for remote controlling this field/form (`null` by default)
- `softTypes`: [ Boolean ] - disable type checking. HIGHLY NOT RECOMMENDED!
- `isolated`: [ Boolean ] - if true meta/value stopped from sharing between parent
- `name`: [ String, Number ] - need for value binding
- `value`: [String, Boolean, Number, Array, Object, Null]
- `initialValue`: [String, Boolean, Number, Array, Object, Null] - values that will be provided for child fields (useful only for forms)
- `onChange`: [ Function ] - handler that will be called on every field value changes
- `onValueChange`: [ Function ] - handler that will be called on every field changes
- `validate`: [ Function ] - validation function/array . if error it need to return the error-message string
- `onChangeValidity`: [ Function ]
- `postponeInvalid`: [ Boolean ]
- `form`: [ Boolean ]
- `onSubmit`: [ Function ] - handler that will be called on `triggerSubmit` only in valid form state
- `exceptionMessage`: [ Any ] - error message in case validate/normalize/format throws the error
- `children`: [ Function ] - obviously, content of field/form
- `autoClean`: [ Boolean ]
- `debug`: [ Boolean ]

### Field `props`: 
- `normalize`: [ Function ] - filter value before call onChange/onSubmit/validate callback 
- `format`: [ Function ] - filter value before rendering (or set value to child field). from outer format to inner format


### Common FieldSet/FieldList/Field children function `params`:
- `triggerChange`: [ Function ] - call when you want to trigger change field by some case
- `triggerReset`: [ Function ] - call when you want to trigger submit, obvious
- `value`: [ Any ]
- `touched`: [ Boolean ] - true when field or some child field was changed once
- `pristine`: [ Boolean ] - true when field or some child field was not changed once
- `submitted`: [ Boolean ] - when this form/field of parent was submitted once
- `valid`: [ Boolean ] - true if children and this field has no errors
- `invalid`: [ Boolean ] - true if children and this field/children has errors
- `hasException`: [ Boolean ] - true if children and this field/children has exceptions
- `error`: [ Any ] - first error are not false, that returned from validate function
- `invalidChildren`: [ Array ] - ids of closest children with errors
- `active`: [ Boolean ] - true if field/children is focusing right now
- `activated`: [ Boolean ] - true if field/children was focused once
- `form`: [ Object ] - Props of closest isolated form (or field itself)

### Common FieldSet/FieldList/Field children function `params` when `props.form` is true:
- `triggerSubmit`: [ Function ] - call when you want to trigger submit, obvious
- `submitSuccess`: [ Boolean ] - state of submitting 
- `submitFailed`: [ Boolean ] - state of submitting
- `submitting`: [ Boolean ] - state of submit processing. in pending (if onSubmit returns the Promise object)
- `submitted`: [ Boolean ] - true if form was submitted once
- `submittedTimes`: [ Number ] - count of `triggerSubmit` calling 
- `submitErrors` - Any - payload of submitting

### Field children function `params`
- `control: { value, onChange, onBlur, onFocus }` - shortcut for putting it into control component (only for components without children fractal-fields)

### FieldList children function `params`:
- `removeItems`: [ Function ]
- `appendItems`: [ Function ]
- `prependItems`: [ Function ]
- `items`: [ Array ]



### Remote api

- `triggerSubmit(id)`
- `triggerChange(id)` 
- `onError(callback)`
