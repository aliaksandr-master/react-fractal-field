/*eslint-env jest*/
import assertChangeProp from '../assertChangeProp';



test('assertChangeProp', () => {
  expect(() => {
    assertChangeProp({}, {}, 'name');
  }).not.toThrow();

  expect(() => {
    assertChangeProp({ name: 'hello' }, {}, 'name');
  }).toThrow();
});
