export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  if (field.touched) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        touched: true
      }
    }
  };

  return state;
};
