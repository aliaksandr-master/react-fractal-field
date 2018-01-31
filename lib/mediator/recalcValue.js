import { omit } from '../utils/lodash';
import { TYPE } from '../utils/const';
import { recursiveRecalcInSurface, updateFieldValue } from './state-helpers';



export default recursiveRecalcInSurface((state, field, level, cleanupName = null) => {
  if (field.simple) {
    return state;
  }

  const childrenWithName = field.children.filter((childID) => {
    const child = state[childID];

    return child && child.name !== null;
  });

  if (field.value === undefined && !childrenWithName.length) {
    return state;
  }

  const prevValue =
    cleanupName !== null && level === 0
      ?
      (field.type === TYPE.ARRAY ? [ ...field.value.filter((_1, key) => String(key) !== String(cleanupName)) ] : { ...omit(field.value, String(cleanupName)) })
      :
      (field.type === TYPE.ARRAY ? [ ...field.value ] : { ...field.value });

  const value = childrenWithName.reduce((value, childID) => {
    const child = state[childID];

    value[child.name] = child.value;

    return value;
  }, prevValue);

  state = updateFieldValue(state, field, value);

  return state;
}, { shareValue: true });
