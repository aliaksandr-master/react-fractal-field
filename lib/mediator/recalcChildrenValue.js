import isEqual from 'lodash/isEqual';
import { SHARE } from '../utils/const';
import { recursiveRecalcInDepth, hasShareLevelChecker } from './state-helpers';



const correctShareValue = hasShareLevelChecker(SHARE.VALUE);

export default recursiveRecalcInDepth((state, field) => {
  const parent = state.fields[field.parentID];

  if (!parent) {
    return state;
  }

  if (field.name === null) {
    return state;
  }

  const value = parent.value === undefined ? undefined : parent.value[field.name];

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

  return state;
}, { share: SHARE.VALUE });
