/*eslint-env jest*/
import submitFailedReducer from '../submitFailedReducer';
import mkField from '../../mkField';


test('submitFailedReducer', () => {
  expect(submitFailedReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(submitFailedReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
