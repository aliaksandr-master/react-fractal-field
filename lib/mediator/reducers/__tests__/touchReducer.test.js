/*eslint-env jest*/
import touchReducer from '../touchReducer';
import mkField from '../../mkField';


test('touchReducer', () => {
  expect(touchReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(touchReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  const field = mkField({ id: 123 });

  field.meta.touched = true;

  expect(touchReducer()({ [123]: field }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
