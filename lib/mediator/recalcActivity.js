import { SHARE } from '../utils/const';
import { recursiveRecalcInSurface, updateFieldMeta } from './state-helpers';



export default recursiveRecalcInSurface((state, field) => {
  const someChildIsActive = state.tree[field.id].some((childID) => state.fields[childID].active);

  if (someChildIsActive === field.meta.active) {
    return state;
  }

  state = updateFieldMeta(state, field, {
    active: true,
    activated: true
  });

  return state;
}, { share: SHARE.META });
