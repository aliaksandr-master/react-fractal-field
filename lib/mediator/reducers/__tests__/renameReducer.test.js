/*eslint-env jest*/
import renameReducer from '../renameReducer';
import mkField from '../../mkField';


test('renameReducer', () => {
  expect(renameReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(renameReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: undefined })).toMatchSnapshot();

  expect(renameReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: '234' })).toMatchSnapshot();

  expect(renameReducer()({ [123]: mkField({ id: 123, name: '234' }) }, { type: 'some', fieldID: 123, payload: '234' })).toMatchSnapshot();
});
