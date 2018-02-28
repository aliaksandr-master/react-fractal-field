import { logWarn } from '../../utils/log';
import { fieldReducer } from '../stateHelpers';



export default () => fieldReducer((state/*, { fieldID }*/) => {
  logWarn('reset reducer has not implemented yet');
  return state;
});
