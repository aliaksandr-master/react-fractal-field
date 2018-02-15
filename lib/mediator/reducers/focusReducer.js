import recalcActivity from '../recalcActivity';
import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID }) => {
  const field = state[fieldID];

  state = updateFieldMeta(state, field, {
    active: true,
    activated: true
  });

  state = recalcActivity(state, field.parentID, field.id);

  return state;
};
