/*eslint-env jest*/
import initReducer from '../initReducer';
import mkField from '../../mkField';


test('initReducer', () => {
  expect(initReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(initReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
