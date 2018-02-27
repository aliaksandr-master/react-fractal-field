import { updateFieldMeta, fieldReducer } from '../state-helpers';



export default () => fieldReducer((state, field) => {
  state = updateFieldMeta(state, field, {
    submitting: false,
    submitted: true,
    submittedTimes: field.meta.submittedTimes + 1,
    submitSuccess: true,
    submitFailed: false
  });

  return state;
});
