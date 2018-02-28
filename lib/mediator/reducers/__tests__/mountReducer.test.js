/*eslint-env jest*/
import mountReducer from '../mountReducer';
import mkField from '../../mkField';


test('mountReducer', () => {
  expect(mountReducer()({}, { type: 'some', fieldID: 123, payload: {} })).toMatchSnapshot();

  expect(mountReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: {} })).toMatchSnapshot();

  expect(mountReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 234, payload: { parentID: 123 } })).toMatchSnapshot();
});
