import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  if (field.meta.submitting) {
    return state;
  }

  state = updateFieldMeta(state, field, {
    submitting: true
  });

  return state;
};
