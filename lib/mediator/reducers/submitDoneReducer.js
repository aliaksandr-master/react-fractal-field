import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID }) => {
  const field = state[fieldID];

  state = updateFieldMeta(state, field, {
    submitting: false,
    submitSuccess: true,
    submitFailed: false,
    submitted: field.meta.submitted + 1
  });

  return state;
};
