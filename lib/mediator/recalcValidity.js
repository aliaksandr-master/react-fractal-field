import isEqual from 'lodash/isEqual';
import { SHARE } from '../utils/const';
import { recursiveRecalcInSurface, updateFieldMeta } from './state-helpers';



export default recursiveRecalcInSurface((state, field) => {
  let valid = !(field.meta.error || field.meta.hasException);

  if (!valid && !field.meta.valid) {
    return state;
  }

  let errorsIn = [];

  if (valid) {
    errorsIn = state.tree[field.id].filter((childID) => !state.fields[childID].meta.valid);

    valid = !errorsIn.length;
  }

  if (valid === field.meta.valid && isEqual(errorsIn, field.meta.errorsIn)) {
    return state;
  }

  state = updateFieldMeta(state, field, {
    valid,
    errorsIn
  });

  return state;
}, { share: SHARE.META });
