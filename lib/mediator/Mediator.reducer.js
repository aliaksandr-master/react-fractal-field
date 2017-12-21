import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import { TYPE, SHARE } from '../utils/const';
import reducer from '../utils/reducer';
import { logWarn } from '../utils/log';
import { recursiveRecalcInSurface, recursiveRecalcInDepth, hasShareLevelChecker } from './state-helpers';
import recalcValidity from './recalcValidity';
import recalcActivity from './recalcActivity';
import recalcValue from './recalcValue';
import recalcChildValue from './recalcChildValue';
import recalcChildrenValue from './recalcChildrenValue';

import mountReducer from './reducers/mountReducer';
import initReducer from './reducers/initReducer';
import resetReducer from './reducers/resetReducer';
import unmountReducer from './reducers/unmountReducer';
import submitReducer from './submitReducer';
import submitStartReducer from './reducers/submitStartReducer';
import submitDoneReducer from './reducers/submitDoneReducer';
import submitFailedReducer from './reducers/submitFailedReducer';
import focusReducer from './reducers/focusReducer';
import blurReducer from './reducers/blurReducer';
import touchReducer from './reducers/touchReducer';
import changeValueReducer from './reducers/changeValueReducer';
import changeValidityReducer from './reducers/changeValidityReducer';
import renameReducer from './reducers/renameReducer';
import exceptionReducer from './reducers/exceptionReducer';



export const MOUNT = 'MOUNT';
export const INIT = 'INIT';
export const UNMOUNT = 'UNMOUNT';
export const RENAME = 'RENAME';
export const RESET = 'RESET';
export const CHANGE_VALUE = 'CHANGE_VALUE';
export const CHANGE_VALIDITY = 'CHANGE_VALIDITY';
export const FORMAT_EXCEPTION = 'FORMAT_EXCEPTION';
export const NORMALIZE_EXCEPTION = 'NORMALIZE_EXCEPTION';
export const VALIDATE_EXCEPTION = 'VALIDATE_EXCEPTION';
export const SUBMIT_START = 'SUBMIT_START';
export const SUBMIT_FAILED = 'SUBMIT_FAILED';
export const SUBMIT_OK = 'SUBMIT_OK';
export const FOCUS = 'FOCUS';
export const BLUR = 'BLUR';
export const SUBMIT = 'SUBMIT';
export const TOUCH = 'TOUCH';



const exceptionPropsMap = [ 'hasFormatException', 'hasNormalizeException', 'hasValidateException' ]
  .reduce((result, value, _i, array) => ({
    ...result,
    [value]: array.filter((v) => v !== value)
  }), {});


export default reducer({
  fields: {},
  tree: {}
}, {
  [MOUNT]: mountReducer(),
  [INIT]: initReducer(),
  [RESET]: resetReducer(),
  [UNMOUNT]: unmountReducer(),
  [SUBMIT]: submitReducer(),
  [SUBMIT_START]: submitStartReducer(),
  [SUBMIT_OK]: submitDoneReducer(),
  [SUBMIT_FAILED]: submitFailedReducer(),
  [FOCUS]: focusReducer(),
  [BLUR]: blurReducer(),
  [TOUCH]: touchReducer(),
  [CHANGE_VALUE]: changeValueReducer(),
  [CHANGE_VALIDITY]: changeValidityReducer(),
  [RENAME]: renameReducer(),
  [FORMAT_EXCEPTION]: exceptionReducer('hasFormatException', exceptionPropsMap),
  [NORMALIZE_EXCEPTION]: exceptionReducer('hasNormalizeException', exceptionPropsMap),
  [VALIDATE_EXCEPTION]: exceptionReducer('hasValidateException', exceptionPropsMap)
});
