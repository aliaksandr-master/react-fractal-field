import recalcValidity from '../recalcValidity';
import { updateFieldMeta, fieldReducer } from '../state-helpers';



export default () => fieldReducer((state, field, error) => {
  state = updateFieldMeta(state, field, {
    error
  });

  state = recalcValidity(state, field.id);

  return state;
});
