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
import FractalField from 'react-fractal-field';

const MyComponent = ({ onSubmit }) => (
  <div>
    <FractalField onSubmit={onSubmit} isolated>
      {({ triggerSubmit }) => (
        <div>
          <FractalField name="value">
            {({ control }) => (
              <div>
                <input {...control} type="text" />
              </div>
            )}
          </FractalField>
          <button onClick={triggerSubmit}>Submit</button>
        </div>
      )}
    </FractalField>  
  </div>
)
```

## API

### FractalField `props`

- `id`: PropTypes.string - ID used for remote controlling this field/form (`null` by default)
- `instantUpdate`: PropTypes.bool - set `true` if you need instant relative field updating (`false` by default)
- `reinitialize`: PropTypes.bool - set `true` if you need reset value when initialValue are update (`false` by default)
- `name`: PropTypes.string - need for data binding
- `children`: PropTypes.oneOfType([ PropTypes.node, PropTypes.func ]).isRequired, - obviously, content of field/form
- `strictTypes`: PropTypes.bool - insert checking of types (`true` by default)
- `initialValue`: PropTypes.any - values that will be provided for child fields (useful only for forms)
- `exception`: PropTypes.string - error message in case validate/normalize/format throws the error


- `onChange`: PropTypes.func - handler that will be called on every field changes
- `onSubmit`: PropTypes.func - handler that will be called on `triggerSubmit` only in valid form state
- `normalize`: PropTypes.func - filter value before call onChange/onSubmit/validate callback 
- `format`: PropTypes.func - filter value before rendering (or set value to child field). from outer format to inner format
- `validate`: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]) - validation function/array . if error it need to return the error-message string
- `preFormat`: PropTypes.func - filter value before rendering (or set value to child field). from inner format to control format (rare useful, but it need sometimes)
- `preNormalize`: PropTypes.func - filter value before set/validate/broadcast onChange middle value. from control value format to inner value format
- `preValidate`: PropTypes.oneOfType([ PropTypes.arrayOf(PropTypes.func), PropTypes.func ]) - validate value before change broadcasting to parent. checks only inner value format


### Control (children) `params`

- `control: { value, onChange }` - shortcut for putting it into control component
- `triggerSubmit` - Function - call when you want to trigger submit, obvious
- `triggerChange` - Function - call when you want to trigger change field by some case
- `triggerReset` - Function - call when you want to trigger submit, obvious
- `submitSuccess` - Boolean - state of submitting 
- `submitFailed` - Boolean - state of submitting
- `submitting` - Boolean - state of submit processing. in pending (if onSubmit returns the Promise object)
- `submitErrors` - Any - payload of submitting
- `name` - String
- `value` - Any
- `touched` - Boolean - when form/field or child field was changed once
- `submitted` - Boolean - when this form/field of parent was submitted once
- `localError` - String - inner error (from preFormat)
- `foreignError` - String - outer error (from normalize)
- `valid` - Boolean - true if children and this field/form has no local/foreign errors
- `error` - String - shortcut for local/foreign error


### Remote api

- `reset(id)`
- `submit(id)` 
- `change(id, name, value)` 
- `initialize(id, value)` 
- `onError(callback)`
