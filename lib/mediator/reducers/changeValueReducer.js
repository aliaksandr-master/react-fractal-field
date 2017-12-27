import isEqual from 'lodash/isEqual';
import recalcChildrenValue from '../recalcChildrenValue';
import recalcValue from '../recalcValue';
import { updateFieldValue } from '../state-helpers';



export default () => (state, { fieldID, payload: value }) => {
  const field = state[fieldID];

  if (isEqual(field.value, value)) {
    return state;
  }

  state = updateFieldValue(state, field, value);

  state = recalcChildrenValue(state, field.id);

  state = recalcValue(state, field.parentID, field.id);

  return state;
};
