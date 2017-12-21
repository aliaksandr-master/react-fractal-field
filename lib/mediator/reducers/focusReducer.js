import recalcActivity from '../recalcActivity';

export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        active: true,
        activated: true
      }
    }
  };

  return recalcActivity(state, field.parentID, field.id);
};