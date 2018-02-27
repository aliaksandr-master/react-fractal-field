import { isEqual } from '../../utils/lodash';
import recalcChildrenValue from '../recalcChildrenValue';
import recalcValue from '../recalcValue';
import { updateFieldValue, fieldReducer } from '../state-helpers';



export default () => fieldReducer((state, field, value) => {
  if (isEqual(field.value, value)) {
    return state;
  }

  state = updateFieldValue(state, field, value);

  state = recalcChildrenValue(state, field.id);

  state = recalcValue(state, field.parentID, field.id);

  return state;
});
