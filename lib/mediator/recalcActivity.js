import { SHARE } from '../utils/const';
import { recursiveRecalcInSurface } from './state-helpers';



export default recursiveRecalcInSurface((state, field) => {
  const someChildIsActive = state.tree[field.id].some((childID) => state.fields[childID].active);

  if (someChildIsActive === field.meta.active) {
    return state;
  }

  return {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        meta: {
          ...field.meta,
          active: someChildIsActive,
          activated: true
        }
      }
    }
  };
}, { share: SHARE.META });
