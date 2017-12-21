import recalcActivity from '../recalcActivity';

export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        active: false
      }
    }
  };

  return recalcActivity(state, field.parentID, field.id);
};
