export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  if (field.meta.touched) {
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
          touched: true
        }
      }
    }
  };

  return state;
};
