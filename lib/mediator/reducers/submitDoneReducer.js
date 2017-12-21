export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        submitting: false,
        submitSuccess: true,
        submitFailed: false,
        submitted: field.submitted + 1
      }
    }
  };

  return state;
};
