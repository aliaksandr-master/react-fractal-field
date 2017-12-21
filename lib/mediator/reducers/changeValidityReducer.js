import recalcValidity from '../recalcValidity';
import isEqual from 'lodash/isEqual';
import recalcValue from '../recalcValue';

export default () => (state, { fieldID, payload: error }) => {
  const field = state.fields[fieldID];

  if (isEqual(field.error, error)) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: { ...field, error }
    }
  };

  const newState = recalcValidity(state, field.id);

  if (newState === state) {
    return state;
  }

  return recalcValue(newState, field.parentID, field.id);
};
