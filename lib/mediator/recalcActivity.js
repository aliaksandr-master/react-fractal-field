import { recursiveRecalcInSurface, updateFieldMeta } from './stateHelpers';



export default recursiveRecalcInSurface((state, field) => {
  const someChildIsActive = state[field.id].children.some((childID) => state[childID].meta.active);

  if (someChildIsActive === field.meta.active) {
    return state;
  }

  state = updateFieldMeta(state, field, {
    active: true,
    activated: true
  });

  return state;
}, { shareMeta: true });
