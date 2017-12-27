import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID }) => {
  const field = state[fieldID];

  if (field.meta.touched) {
    return state;
  }

  state = updateFieldMeta(state, field, {
    touched: true
  });

  return state;
};
