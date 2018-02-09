import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID }) => {
  const field = state[fieldID];

  state = updateFieldMeta(state, field, {
    submitted: true,
    submittedTimes: field.meta.submittedTimes + 1,
    submitting: false
  });

  return state;
};
