import { updateFieldMeta, fieldReducer } from '../state-helpers';



export default () => fieldReducer((state, field) => {
  if (field.meta.touched) {
    return state;
  }

  state = updateFieldMeta(state, field, {
    touched: true
  });

  return state;
});
