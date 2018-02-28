/*eslint-env jest*/
import submitStartReducer from '../submitStartReducer';
import mkField from '../../mkField';


test('submitStartReducer', () => {
  expect(submitStartReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(submitStartReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  const field = mkField({ id: 123 });

  field.meta.submitting = true;

  expect(submitStartReducer()({ [123]: field }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
