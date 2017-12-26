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
          submitted: field.meta.submitted + 1,
          submitting: false
        }
      }
    }
  };

  return state;
};
