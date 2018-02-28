/*eslint-env jest*/
import changeValidityReducer from '../changeValidityReducer';
import mkField from '../../mkField';


test('changeValidityReducer', () => {
  expect(changeValidityReducer()({}, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();

  expect(changeValidityReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();
});
