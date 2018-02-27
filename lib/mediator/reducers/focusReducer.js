import recalcActivity from '../recalcActivity';
import { updateFieldMeta, fieldReducer } from '../state-helpers';



export default () => fieldReducer((state, field) => {
  state = updateFieldMeta(state, field, {
    active: true,
    activated: true
  });

  state = recalcActivity(state, field.parentID, field.id);

  return state;
});
