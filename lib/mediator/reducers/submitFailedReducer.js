import { updateFieldMeta, fieldReducer } from '../stateHelpers';



export default () => fieldReducer((state, field) => {
  state = updateFieldMeta(state, field, {
    submitting: false,
    submitted: true,
    submittedTimes: field.meta.submittedTimes + 1,
    submitSuccess: false,
    submitFailed: true
  });

  return state;
});
