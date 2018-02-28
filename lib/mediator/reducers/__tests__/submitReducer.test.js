/*eslint-env jest*/
import submitReducer from '../submitReducer';
import mkField from '../../mkField';


test('submitReducer', () => {
  expect(submitReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(submitReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
