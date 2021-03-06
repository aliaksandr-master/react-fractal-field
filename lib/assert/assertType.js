import { isString, isBoolean, isNumber, isArray, isNaN, isPlainObject } from '../utils/lodash';
import { TYPE } from '../utils/const';



export default function assertSameType (name, type, value) {
  if (type === null) {
    return;
  }

  if (type === TYPE.STRING) {
    if (isString(value)) {
      return;
    }
  } else if (type === TYPE.BOOLEAN) {
    if (isBoolean(value)) {
      return;
    }
  } else if (type === TYPE.NUMBER) {
    if (isNumber(value) && !isNaN(value)) {
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
  }

  throw new TypeError(`[FractalField] "${name}" has invalid type. ${type} type expected, but ${Object.prototype.toString.call(value)} given`);
}
