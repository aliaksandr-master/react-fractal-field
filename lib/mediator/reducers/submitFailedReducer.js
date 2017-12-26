import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = updateFieldMeta(state, field, {
    submitting: false,
    submitSuccess: false,
    submitFailed: true,
    submitted: field.meta.submitted + 1
  });

  return state;
};
