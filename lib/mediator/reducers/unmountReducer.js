import { omit } from '../../utils/lodash';
import recalcValidity from '../recalcValidity';
import recalcValue from '../recalcValue';
import { fieldReducer } from '../stateHelpers';



export default () => {
  const remove = fieldReducer((state, field) => {
    const parentID = field.parentID;

    state = omit(state, field.id);

    // state = field.children.reduce((state, fieldID) => remove(state, { fieldID: field.id }), state);

    if (parentID) {
      const parent = state[parentID];

      if (parent) {
        state = {
          ...state,
          [parentID]: {
            ...parent,
            version: parent.version + 1,
            children: parent.children.filter((id) => id !== field.id)
          }
        };
      }
    }

    state = recalcValidity(state, parentID, field.id);

    state = recalcValue(state, parentID, field.id, field.autoClean ? field.name : null);

    return state;
  });

  return remove;
};
