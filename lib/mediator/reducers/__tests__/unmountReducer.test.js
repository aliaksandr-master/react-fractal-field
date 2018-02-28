/*eslint-env jest*/
import unmountReducer from '../unmountReducer';
import mkField from '../../mkField';
import { TYPE } from '../../../utils/const';


test('unmountReducer', () => {
  expect(unmountReducer()({}, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  expect(unmountReducer()({ [123]: mkField({ id: 123 }) }, { type: 'some', fieldID: 123 })).toMatchSnapshot();

  const parent = mkField({ id: 123, complexValueType: TYPE.OBJECT, value: { [123]: 234 } });

  parent.children = [ 234 ];

  expect(unmountReducer()({ [123]: parent, [234]: mkField({ id: 234, parentID: 123, autoClean: true, name: 'some' }) }, { type: 'some', fieldID: 234 })).toMatchSnapshot();
});
