import { updateFieldMeta, fieldReducer } from '../state-helpers';



export default () => fieldReducer((state, field) => {
  state = updateFieldMeta(state, field, {
    submitted: true,
    submittedTimes: field.meta.submittedTimes + 1,
    submitting: false
  });

  return state;
});
