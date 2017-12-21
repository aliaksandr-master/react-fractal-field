export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        submitted: field.submitted + 1,
        submitting: false
      }
    }
  };

  return state;
};
