/*eslint-env jest*/
import focusReducer from '../focusReducer';
import mkField from '../../mkField';


test('focusReducer', () => {
  expect(focusReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(focusReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
