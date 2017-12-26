export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        meta: {
          ...field.meta,
          submitting: false,
          submitSuccess: true,
          submitFailed: false,
          submitted: field.meta.submitted + 1
        }
      }
    }
  };

  return state;
};
