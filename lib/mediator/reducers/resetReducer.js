import { logWarn } from '../../utils/log';
import { fieldReducer } from '../state-helpers';



export default () => fieldReducer((state/*, { fieldID }*/) => {
  logWarn('reset reducer has not implemented yet');
  return state;
});
