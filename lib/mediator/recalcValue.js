import { TYPE, SHARE } from '../utils/const';
import { recursiveRecalcInSurface, updateFieldValue } from './state-helpers';



export default recursiveRecalcInSurface((state, field) => {
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

  const value = childrenWithName.reduce((value, childID) => {
    const child = state[childID];

    value[child.name] = child.value;

    return value;
  }, field.type === TYPE.ARRAY ? [ ...field.value ] : { ...field.value });

  state = updateFieldValue(state, field, value);

  return state;
}, { share: SHARE.VALUE });
