import { SHARE } from '../utils/const';
import recalcValue from './recalcValue';
import recalcChildrenValue from './recalcChildrenValue';
import { hasShareLevelChecker, updateFieldValue } from './state-helpers';



const correctShareValue = hasShareLevelChecker(SHARE.VALUE);


export default (state, fieldID) => {
  const field = state[fieldID];

  if (!field) {
    return state;
  }

  if (field.name === null) {
    return state;
  }

  if (!correctShareValue(field.share)) {
    return state;
  }

  const parent = state[field.parentID];

  if (!parent) {
    return state;
  }

  if (parent.value === undefined) {
    return recalcValue(state, parent.id);
  }

  state = updateFieldValue(state, field, parent.value[field.name]);

  return recalcChildrenValue(state, field.ID);
};
