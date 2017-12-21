import isEqual from 'lodash/isEqual';
import recalcChildrenValue from '../recalcChildrenValue';
import recalcValue from '../recalcValue';

export default () => (state, { fieldID, payload: value }) => {
  const field = state.fields[fieldID];

  if (isEqual(field.value, value)) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        value
      }
    }
  };

  state = recalcChildrenValue(state, field.id);

  state = recalcValue(state, field.parentID, field.id);

  return state;
};
