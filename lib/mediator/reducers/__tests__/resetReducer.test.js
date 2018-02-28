/*eslint-env jest*/
import resetReducer from '../resetReducer';
import mkField from '../../mkField';


test('resetReducer', () => {
  expect(resetReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(resetReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
