import { fieldReducer, updateFieldMeta, updateFieldValue } from '../stateHelpers';
import { mkMeta } from '../mkField';
import recalcValidity from '../recalcValidity';
import recalcValue from '../recalcValue';
import recalcTouch from '../recalcTouch';
import recalcChildrenValue from '../recalcChildrenValue';



export default () => fieldReducer((state, field, value = undefined) => {
  state = updateFieldMeta(state, field, mkMeta());

  state = updateFieldValue(state, state[field.id], value);

  state = recalcTouch(state, field.parentID, field.id);

  state = recalcChildrenValue(state, field.id);

  state = recalcValue(state, field.parentID, field.id);

  state = recalcValidity(state, field.parentID, field.id);

  return state;
});
