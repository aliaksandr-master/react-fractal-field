import recalcValue from '../recalcValue';
import { updateFieldMeta, updateFieldProps } from '../state-helpers';



export default () => (state, { fieldID, payload: name = null }) => {
  const field = state.fields[fieldID];

  if (field.name === name) {
    return state;
  }

  state = updateFieldProps(state, field, {
    name
  });

  return recalcValue(state, field.parentID, field.id);
};
