import recalcActivity from '../recalcActivity';
import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = updateFieldMeta(state, field, {
    active: true,
    activated: true
  });

  return recalcActivity(state, field.parentID, field.id);
};
