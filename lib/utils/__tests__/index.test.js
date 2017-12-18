/*eslint-env jest*/
import PrimitiveEE from '../PrimitiveEE';



test('ee', () => {
  const ee = PrimitiveEE();

  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const fn3 = jest.fn();
  const fn4 = jest.fn();

  const off1 = ee.on(fn1);
  const off2 = ee.once(fn2);
  const off3 = ee.on(fn3);

  expect(() => {
    ee.on('some');
  }).toThrow();

  ee.emit(111);
  ee.emit(222);

  expect(ee.length()).toBe(2);

  off3();

  ee.emit(333);

  ee.cleanup();
  ee.destroy();
  ee.destroy();
  ee.cleanup();

  expect(ee.length()).toBe(0);

  const off4 = ee.on(fn4);

  off4();

  ee.emit(444);

  expect(fn1).toHaveBeenCalledTimes(3);
  expect(fn2).toHaveBeenCalledTimes(1);
  expect(fn3).toHaveBeenCalledTimes(2);
  expect(fn4).not.toBeCalled();
});
