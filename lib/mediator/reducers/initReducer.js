import recalcValue from '../recalcValue';
import recalcChildValue from '../recalcChildValue';



export default () => (state, { fieldID }) => {
  const field = state[fieldID];

  state = recalcChildValue(state, fieldID);

  return recalcValue(state, field.parentID, field.id);
};
