import { isEqual } from '../utils/lodash';
import { recursiveRecalcInSurface, updateFieldMeta } from './state-helpers';



export default recursiveRecalcInSurface((state, field) => {
  let valid = !(field.meta.error || field.meta.hasException);

  if (!valid && !field.meta.valid) {
    return state;
  }

  let errorsIn = [];

  if (valid) {
    errorsIn = state[field.id].children.filter((childID) => !state[childID].meta.valid);

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
}, { shareMeta: true });
