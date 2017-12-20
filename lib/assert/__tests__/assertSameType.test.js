/*eslint-env jest*/
import assertSameType from '../assertSameType';



test('assertSameType', () => {
  expect(() => {
    assertSameType('some', 1, 2);
  }).not.toThrow();

  expect(() => {
    assertSameType('some', 1, '2');
  }).toThrow();
});
