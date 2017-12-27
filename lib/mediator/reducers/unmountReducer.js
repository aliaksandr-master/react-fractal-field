import omit from 'lodash/omit';
import recalcValidity from '../recalcValidity';
import recalcValue from '../recalcValue';



export default () => (state, { fieldID }) => {
  const field = state[fieldID];
  const parentID = field.parentID;

  state = omit(state, fieldID);

  if (parentID) {
    const parent = state[field.parentID];

    if (parent) {
      state = {
        ...state,
        [parentID]: {
          ...parent,
          children: parent.children.filter((id) => id !== fieldID)
        }
      };
    }
  }

  state = recalcValidity(state, parentID, fieldID);

  state = recalcValue(state, parentID, field.id);

  return state;
};
