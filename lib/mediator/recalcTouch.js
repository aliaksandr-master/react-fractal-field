import { recursiveRecalcInSurface, updateFieldMeta } from './stateHelpers';



export default recursiveRecalcInSurface((state, field) => {
  const someChildIsActive = state[field.id].children.some((childID) => state[childID].meta.touched);

  if (someChildIsActive === field.meta.touched) {
    return state;
  }

  state = updateFieldMeta(state, field, {
    touched: true
  });

  return state;
}, { shareMeta: true });
