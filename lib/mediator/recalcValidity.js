import isEqual from 'lodash/isEqual';
import { SHARE } from '../utils/const';
import { recursiveRecalcInSurface } from './state-helpers';



export default recursiveRecalcInSurface((state, field) => {
  let valid = !(field.error || field.hasException);

  if (!valid && !field.valid) {
    return state;
  }

  let errorsIn = [];

  if (valid) {
    errorsIn = state.tree[field.id].filter((childID) => !state.fields[childID].valid);

    valid = !errorsIn.length;
  }

  if (valid === field.valid && isEqual(errorsIn, field.errorsIn)) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        valid,
        errorsIn
      }
    }
  };

  return state;
}, { share: SHARE.META });
