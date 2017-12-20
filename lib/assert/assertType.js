import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import { TYPE } from '../utils/const';



export default function assertSameType (name, type, value) {
  if (type === TYPE.STRING) {
    if (isString(value)) {
      return;
    }
  } else if (type === TYPE.BOOLEAN) {
    if (isBoolean(value)) {
      return;
    }
  } else if (type === TYPE.NUMBER) {
    if (isNumber(value)) {
      return;
    }
  } else if (type === TYPE.OBJECT) {
    if (isPlainObject(value)) {
      return;
    }
  } else if (type === TYPE.ARRAY) {
    if (isArray(value)) {
      return;
    }
  } else {
    throw new TypeError('wrong type was specified');
  }

  throw new TypeError(`"${name}" has invalid type. ${type} type expected, but ${Object.prototype.toString.call(value)} given`);
}
