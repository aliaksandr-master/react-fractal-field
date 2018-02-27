import { updateFieldMeta, fieldReducer } from '../state-helpers';



export default () => fieldReducer((state, field) => {
  if (field.meta.submitting) {
    return state;
  }

  state = updateFieldMeta(state, field, {
    submitting: true
  });

  return state;
});
