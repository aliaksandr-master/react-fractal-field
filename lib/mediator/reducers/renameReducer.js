import recalcValue from '../recalcValue';



export default () => (state, { fieldID, payload: name = null }) => {
  const field = state.fields[fieldID];

  if (field.name === name) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: { ...field, name }
    }
  };

  return recalcValue(state, field.parentID, field.id);
};
