import { updateFieldMeta } from '../state-helpers';

export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = updateFieldMeta(state, field, {
    submitted: field.meta.submitted + 1,
    submitting: false
  });

  return state;
};