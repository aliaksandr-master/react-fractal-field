/*eslint-env jest*/
import resetReducer from '../resetReducer';
import mkField from '../../mkField';


test('resetReducer', () => {
  expect(resetReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  const field = mkField({ id: 123 });

  field.meta.touched = true;

  expect(resetReducer()({ [123]: field }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
