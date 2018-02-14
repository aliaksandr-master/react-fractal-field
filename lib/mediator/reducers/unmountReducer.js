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

    console.log(field.children);

    state = field.children.reduce((state, fieldID) => remove(state, { fieldID }), state);

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

    state = recalcValue(state, parentID, field.id, field.autoClean ? field.name : null);

    return state;
  };

  return remove;
}
