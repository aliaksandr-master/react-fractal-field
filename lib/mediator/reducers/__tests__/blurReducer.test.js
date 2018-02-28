/*eslint-env jest*/
import blurReducer from '../blurReducer';
import mkField from '../../mkField';


test('blurReducer', () => {
  expect(blurReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(blurReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();
});
