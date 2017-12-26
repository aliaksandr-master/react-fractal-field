import { TYPE, SHARE } from '../utils/const';
import { recursiveRecalcInSurface, updateFieldValue } from './state-helpers';



export default recursiveRecalcInSurface((state, field) => {
  const children = state.tree[field.id];

  if (field.simple) {
    return state;
  }

  const childrenWithName = children.filter((childID) => {
    const child = state.fields[childID];

    return child && child.name !== null;
  });

  if (field.value === undefined && !childrenWithName.length) {
    return state;
  }

  const value = childrenWithName.reduce((value, childID) => {
    const child = state.fields[childID];

    value[child.name] = child.value;

    return value;
  }, field.type === TYPE.ARRAY ? [ ...field.value ] : { ...field.value });

  state = updateFieldValue(state, field, value);

  return state;
}, { share: SHARE.VALUE });
