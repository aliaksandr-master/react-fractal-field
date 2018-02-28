import recalcValidity from '../recalcValidity';
import { updateFieldMeta, fieldReducer } from '../stateHelpers';



export default () => fieldReducer((state, field, error) => {
  state = updateFieldMeta(state, field, {
    error
  });

  state = recalcValidity(state, field.id);

  return state;
});
