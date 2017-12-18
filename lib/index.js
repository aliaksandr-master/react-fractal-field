import Field from './components/Field';
import FieldNumber from './components/FieldNumber';
import FieldBoolean from './components/FieldBoolean';
import FieldSet from './components/FieldSet';
import FieldList from './components/FieldList';
import { reset, submit, change, initialize, error, blur, focus } from './utils/global';



export { Field, FieldNumber, FieldBoolean, FieldSet, FieldList };
export const triggerReset = (id, ...args) => reset.publish(id, ...args);
export const triggerSubmit = (id, ...args) => submit.publish(id, ...args);
export const triggerChange = (id, ...args) => submit.publish(id, ...args);
export const triggerBlur = (id, ...args) => blur.publish(id, ...args);
export const triggerFocus = (id, ...args) => focus.publish(id, ...args);
export const triggerInitialize = (id, ...args) => submit.publish(id, ...args);
export const onError = (...args) => error.subscribe(...args);
