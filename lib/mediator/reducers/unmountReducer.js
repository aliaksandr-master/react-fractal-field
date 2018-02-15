import { omit } from '../../utils/lodash';
import recalcValidity from '../recalcValidity';
import recalcValue from '../recalcValue';



export default () => {
  const remove = (state, { fieldID }) => {
    const field = state[fieldID];

    if (!field) {
      return state;
    }

    const parentID = field.parentID;

    state = omit(state, fieldID);

    state = field.children.reduce((state, fieldID) => remove(state, { fieldID }), state);

    if (parentID) {
      const parent = state[parentID];

      if (parent) {
        state = {
          ...state,
          [parentID]: {
            ...parent,
            version: parent.version + 1,
            children: parent.children.filter((id) => id !== fieldID)
          }
        };
      }
    }

    state = recalcValidity(state, parentID, fieldID);

    state = recalcValue(state, parentID, field.id, field.autoClean ? field.name : null);

    return state;
  };

  return remove;
};
