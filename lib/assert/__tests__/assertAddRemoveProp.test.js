/*eslint-env jest*/
import assertAddRemoveProp from '../assertAddRemoveProp';



test('assertAddRemoveProp', () => {
  expect(() => {
    assertAddRemoveProp({}, {}, 'name');
  }).not.toThrow();

  expect(() => {
    assertAddRemoveProp({ name: 'hello' }, {}, 'name');
  }).toThrow();
});
