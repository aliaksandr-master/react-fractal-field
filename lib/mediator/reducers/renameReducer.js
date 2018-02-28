import recalcValue from '../recalcValue';
import { updateFieldProps, fieldReducer } from '../stateHelpers';



export default () => fieldReducer((state, field, name = null) => {
  if (field.name === name) {
    return state;
  }

  state = updateFieldProps(state, field, {
    name
  });

  state = recalcValue(state, field.parentID, field.id);

  return state;
});
