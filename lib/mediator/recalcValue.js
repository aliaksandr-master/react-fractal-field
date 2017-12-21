import isEqual from 'lodash/isEqual';
import { TYPE, SHARE } from '../utils/const';
import { recursiveRecalcInSurface } from './state-helpers';



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

  if (isEqual(field.value, value)) {
    return state;
  }

  return {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        value
      }
    }
  };
}, { share: SHARE.VALUE });