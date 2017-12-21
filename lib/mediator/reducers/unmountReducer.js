import omit from 'lodash/omit';
import recalcValidity from '../recalcValidity';
import recalcValue from '../recalcValue';

export default () => (state, { fieldID }) => {
  const field = state.fields[fieldID];
  const parentID = field.parentID;

  state = {
    ...state,
    fields: omit(state.fields, fieldID),
    tree: {
      ...state.tree,
      [parentID]: state.tree[parentID].filter((id) => id !== fieldID)
    }
  };

  state = recalcValidity(state, parentID, fieldID);

  state = recalcValue(state, parentID, field.id);

  return state;
};
