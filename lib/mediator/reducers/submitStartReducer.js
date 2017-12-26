export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  if (field.meta.submitting) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        meta: {
          ...field.meta,
          submitting: true
        }
      }
    }
  };

  return state;
};
