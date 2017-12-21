import isEqual from 'lodash/isEqual';
import { SHARE } from '../utils/const';
import recalcValue from './recalcValue';
import recalcChildrenValue from './recalcChildrenValue';
import { hasShareLevelChecker } from './state-helpers';



const correctShareValue = hasShareLevelChecker(SHARE.VALUE);


export default (state, fieldID) => {
  const field = state.fields[fieldID];

  if (!field) {
    return state;
  }

  if (field.name === null) {
    return state;
  }

  if (!correctShareValue(field.share)) {
    return state;
  }

  const parent = state.fields[field.parentID];

  if (!parent) {
    return state;
  }

  if (parent.value === undefined) {
    return recalcValue(state, parent.id);
  }

  const prevState = state;

  const value = parent.value[field.name];

  if (isEqual(field.value, value)) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        value
      }
    }
  };

  return recalcChildrenValue(state, field.ID);
};
