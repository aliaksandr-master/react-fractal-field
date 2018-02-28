import { updateFieldMeta, fieldReducer } from '../stateHelpers';
import recalcTouch from '../recalcTouch';



export default () => fieldReducer((state, field) => {
  if (field.meta.touched) {
    return state;
  }

  state = updateFieldMeta(state, field, {
    touched: true
  });

  state = recalcTouch(state, field.parentID, field.id);

  return state;
});
