import { isString, isNumber, isArray, isObject, isNil, isNaN, isBoolean } from '../utils/lodash';
import { TYPE } from './const';



export default (value) => {
  if (isNil(value) || isNaN(value)) {
    return null;
  }

  if (isString(value)) {
    return TYPE.STRING;
  }

  if (isBoolean(value)) {
    return TYPE.BOOLEAN;
  }

  if (isNumber(value)) {
    return TYPE.NUMBER;
  }

  if (isArray(value)) {
    return TYPE.ARRAY;
  }

  if (isObject(value)) {
    return TYPE.OBJECT;
  }

  if (process.ENV !== 'production') {
    throw new Error('[FractalField] invalid type');
  }

  return null;
};
