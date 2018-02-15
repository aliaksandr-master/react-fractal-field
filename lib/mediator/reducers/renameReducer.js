import recalcValue from '../recalcValue';
import { updateFieldProps } from '../state-helpers';



export default () => (state, { fieldID, payload: name = null }) => {
  const field = state[fieldID];

  if (field.name === name) {
    return state;
  }

  state = updateFieldProps(state, field, {
    name
  });

  state = recalcValue(state, field.parentID, field.id);

  return state;
};
