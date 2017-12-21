export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  if (field.submitting) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        submitting: true
      }
    }
  };

  return state;
};
