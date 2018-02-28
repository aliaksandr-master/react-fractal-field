/*eslint-env jest*/
import submitDoneReducer from '../submitDoneReducer';
import mkField from '../../mkField';


test('submitDoneReducer', () => {
  expect(submitDoneReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(submitDoneReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
