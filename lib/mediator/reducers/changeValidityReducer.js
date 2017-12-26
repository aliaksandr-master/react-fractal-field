import isEqual from 'lodash/isEqual';
import recalcValidity from '../recalcValidity';
import recalcValue from '../recalcValue';
import { updateFieldMeta } from '../state-helpers';



export default () => (state, { fieldID, payload: error }) => {
  const field = state.fields[fieldID];

  state = updateFieldMeta(state, field, {
    error
  });

  state = recalcValidity(state, field.id);

  return state;
};
