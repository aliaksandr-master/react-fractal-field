import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID }) => {
  const field = state[fieldID];

  state = updateFieldMeta(state, field, {
    submitting: false,
    submitted: true,
    submittedTimes: field.meta.submittedTimes + 1,
    submitSuccess: false,
    submitFailed: true
  });

  return state;
};
