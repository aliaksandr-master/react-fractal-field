/*eslint-env jest*/
import changeValueReducer from '../changeValueReducer';
import mkField from '../../mkField';


test('changeValueReducer', () => {
  expect(changeValueReducer()({}, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();

  expect(changeValueReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();

  expect(changeValueReducer()({ [123]: mkField({ id: 123, value: 'some' }) }, { type: 'some', fieldID: 123, payload: 'some' })).toMatchSnapshot();
});
