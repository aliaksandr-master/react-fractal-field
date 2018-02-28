/*eslint-env jest*/
import exceptionReducer from '../exceptionReducer';
import mkField from '../../mkField';


describe('exceptionReducer', () => {
  it('hasFormatException', () => {
    expect(exceptionReducer('hasFormatException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();

    expect(exceptionReducer('hasFormatException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: null })).toMatchSnapshot();

    expect(exceptionReducer('hasFormatException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: '' })).toMatchSnapshot();

    expect(exceptionReducer('hasFormatException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();
  });
  it('hasNormalizeException', () => {
    expect(exceptionReducer('hasNormalizeException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();

    expect(exceptionReducer('hasNormalizeException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: null })).toMatchSnapshot();

    expect(exceptionReducer('hasNormalizeException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: '' })).toMatchSnapshot();

    expect(exceptionReducer('hasNormalizeException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();
  });
  it('hasValidateException', () => {
    expect(exceptionReducer('hasValidateException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();

    expect(exceptionReducer('hasValidateException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: null })).toMatchSnapshot();

    expect(exceptionReducer('hasValidateException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: '' })).toMatchSnapshot();

    expect(exceptionReducer('hasValidateException')({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();
  });
});
