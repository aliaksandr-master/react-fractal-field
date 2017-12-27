import recalcValidity from '../recalcValidity';
import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID, payload: error }) => {
  const field = state[fieldID];

  state = updateFieldMeta(state, field, {
    error
  });

  state = recalcValidity(state, field.id);

  return state;
};
