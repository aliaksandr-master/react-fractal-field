import { omit, isUndefined } from '../utils/lodash';
import { TYPE } from '../utils/const';
import { recursiveRecalcInSurface, updateFieldValue } from './stateHelpers';



export default recursiveRecalcInSurface((state, field, level, cleanupName = null) => {
  if (!field.complexValueType) {
    return state;
  }

  const childrenWithName = field.children.filter((childID) => {
    const child = state[childID];

    return child && child.name !== null;
  });

  if (field.value === undefined && !childrenWithName.length) {
    return state;
  }

  const isListField = field.complexValueType === TYPE.ARRAY;

  let val = isListField ? [ ...field.value ].filter((item) => !isUndefined(item)) : { ...field.value };

  if (cleanupName !== null && level === 0) {
    val = isListField ? [ ...field.value.filter((_1, key) => String(key) !== String(cleanupName)) ] : { ...omit(field.value, String(cleanupName)) };
  }

  const value = childrenWithName.reduce((value, childID) => {
    const child = state[childID];

    value[child.name] = child.value;

    return value;
  }, val);

  state = updateFieldValue(state, field, value);

  return state;
}, { shareValue: true });
