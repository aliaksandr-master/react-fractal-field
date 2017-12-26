import { SHARE } from '../utils/const';
import { recursiveRecalcInDepth, updateFieldValue } from './state-helpers';



export default recursiveRecalcInDepth((state, field) => {
  const parent = state.fields[field.parentID];

  if (!parent) {
    return state;
  }

  if (field.name === null) {
    return state;
  }

  state = updateFieldValue(state, field, parent.value === undefined ? undefined : parent.value[field.name]);

  return state;
}, { share: SHARE.VALUE });
