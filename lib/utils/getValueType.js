import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isNaN from 'lodash/isNaN';
import isBoolean from 'lodash/isBoolean';
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
