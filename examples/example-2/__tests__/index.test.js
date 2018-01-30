/*eslint-env jest*/
import '../index';
import { triggerChange, /*triggerInitialize, triggerFocus, triggerBlur, */triggerSubmit, /*triggerReset, */onError } from '../../../lib';

test('example-3', () => {
  triggerChange('main_radio', 'some-1');
  //triggerInitialize('main_radio');
  //triggerFocus('main_radio');
  //triggerFocus('main_radio');
  //triggerBlur('main_radio');
  triggerSubmit('main_radio');
  //triggerReset('main_radio');
  onError(() => {});
  expect(true).toBe(true);
});
