import recalcValue from '../recalcValue';
import recalcChildValue from '../recalcChildValue';
import { fieldReducer } from '../stateHelpers';



export default () => fieldReducer((state, field) => {
  state = recalcChildValue(state, field.id);

  state = recalcValue(state, field.parentID, field.id);

  state = recalcValue(state, field.parentID, field.id);

  return state;
});
