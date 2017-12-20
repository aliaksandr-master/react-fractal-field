import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import { TYPE, SHARE } from '../utils/const';
import reducer from './reducer';
import { logWarn } from './log';



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



const hasShareLevelChecker = (shareLevel) => {
  if (shareLevel === SHARE.ALL) {
    return (share) => share !== SHARE.NONE;
  }

  if (shareLevel === SHARE.META) {
    return (share) => share === SHARE.ALL || share === SHARE.META;
  }

  if (shareLevel === SHARE.VALUE) {
    return (share) => share === SHARE.ALL || share === SHARE.VALUE;
  }

  return () => false;
};



const recursiveRecalcInSurface = (func, { share = SHARE.ALL } = {}) => {
  const shareIsCorrect = hasShareLevelChecker(share);

  const apply = (state, fieldID, childID = null) => {
    if (childID) {
      const field = state.fields[childID];

      if (field && !shareIsCorrect(field.share)) {
        return state;
      }
    }

    const field = state.fields[fieldID];

    if (!field) {
      return state;
    }

    const prevState = state;

    state = func(state, field);

    if (prevState === state) {
      return state;
    }

    return apply(state, field.parentID, field.id);
  };

  return apply;
};



const recursiveRecalcInDepth = (func, { share = SHARE.ALL } = {}) => {
  const shareIsCorrect = hasShareLevelChecker(share);

  const apply = (state, fieldID) => {
    const field = state.fields[fieldID];

    if (!field) {
      return state;
    }

    state.tree[fieldID].forEach((childID) => {
      const child = state.fields[childID];

      if (!child) {
        return;
      }

      if (child.name === null) {
        return;
      }

      if (!shareIsCorrect(child.share)) {
        return;
      }

      state = func(state, child);

      state = apply(state, childID);
    });

    return state;
  };

  return apply;
};



const recalcValidity = recursiveRecalcInSurface((state, field) => {
  let valid = !(field.error || field.hasException);

  if (!valid && !field.valid) {
    return state;
  }

  let errorsIn = [];

  if (valid) {
    errorsIn = state.tree[field.id].filter((childID) => !state.fields[childID].valid);

    valid = !errorsIn.length;
  }

  if (valid === field.valid && isEqual(errorsIn, field.errorsIn)) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        valid,
        errorsIn
      }
    }
  };

  return state;
}, { share: SHARE.META });

const recalcActivity = recursiveRecalcInSurface((state, field) => {
  const someChildIsActive = state.tree[field.id].some((childID) => state.fields[childID].active);

  if (someChildIsActive === field.active) {
    return state;
  }

  return {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        active: someChildIsActive,
        activated: true
      }
    }
  };
}, { share: SHARE.META });

const recalcValue = recursiveRecalcInSurface((state, field) => {
  const children = state.tree[field.id];

  if (field.simple) {
    return state;
  }

  const childrenWithName = children.filter((childID) => {
    const child = state.fields[childID];

    return child && child.name !== null;
  });

  if (field.value === undefined && !childrenWithName.length) {
    return state;
  }

  const value = childrenWithName.reduce((value, childID) => {
    const child = state.fields[childID];

    value[child.name] = child.value;

    return value;
  }, field.type === TYPE.ARRAY ? [ ...field.value ] : { ...field.value });

  if (isEqual(field.value, value)) {
    return state;
  }

  return {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        value
      }
    }
  };
}, { share: SHARE.VALUE });

const correctShareValue = hasShareLevelChecker(SHARE.VALUE);

const recalcChildrenValue = recursiveRecalcInDepth((state, field) => {
  const parent = state.fields[field.parentID];

  if (!parent) {
    return state;
  }

  if (field.name === null) {
    return state;
  }

  const value = parent.value === undefined ? undefined : parent.value[field.name];

  if (isEqual(field.value, value)) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        value
      }
    }
  };

  return state;
}, { share: SHARE.VALUE });


const recalcChildValue = (state, fieldID) => {
  const field = state.fields[fieldID];

  if (!field) {
    return state;
  }

  if (field.name === null) {
    return state;
  }

  if (!correctShareValue(field.share)) {
    return state;
  }

  const parent = state.fields[field.parentID];

  if (!parent) {
    return state;
  }

  if (parent.value === undefined) {
    return recalcValue(state, parent.id);
  }

  const prevState = state;

  const value = parent.value[field.name];

  if (isEqual(field.value, value)) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        value
      }
    }
  };

  return recalcChildrenValue(state, field.ID);
};


// REDUCERS

const exceptionPropsMap = [ 'hasFormatException', 'hasNormalizeException', 'hasValidateException' ]
  .reduce((result, value, _i, array) => ({
    ...result,
    [value]: array.filter((v) => v !== value)
  }), {});

const exceptionReducer = (propName) => (state, { fieldID, payload: exception }) => {
  const field = state.fields[fieldID];

  exception = Boolean(exception);

  if (field[propName] === exception) {
    return state;
  }

  const hasException = exception || exceptionPropsMap[propName].some((propName) => Boolean(field[propName]));

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        valid: field.valid && !exception,
        hasException,
        [propName]: exception
      }
    }
  };

  return recalcValidity(state, field.parentID, field.id);
};


const renameReducer = () => (state, { fieldID, payload: name = null }) => {
  const field = state.fields[fieldID];

  if (field.name === name) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: { ...field, name }
    }
  };

  return recalcValue(state, field.parentID, field.id);
};

const changeValidityReducer = () => (state, { fieldID, payload: error }) => {
  const field = state.fields[fieldID];

  if (isEqual(field.error, error)) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: { ...field, error }
    }
  };

  const newState = recalcValidity(state, field.id);

  if (newState === state) {
    return state;
  }

  return recalcValue(newState, field.parentID, field.id);
};

const mountReducer = () => (state, { fieldID, payload: { parentID, name = null, ...params } }) => {
  const field = {
    id: fieldID,
    name,
    valid: true,
    share: SHARE.ALL,
    value: undefined,
    touched: false,

    simple: false, // if true component might have named children

    active: false,
    activated: false,

    submitted: 0,
    submitting: false,
    submitSuccess: false,
    submitFailed: false,

    error: null,
    errorsIn: [],
    hasException: false,
    hasFormatException: false,
    hasNormalizeException: false,
    hasValidateException: false,

    parentID,
    ...params
  };

  state = {
    ...state,
    tree: {
      ...state.tree,
      ...(parentID ? { [parentID]: state.tree[parentID] ? [ ...state.tree[parentID], fieldID ] : [ fieldID ] } : {}),
      [fieldID]: []
    },
    fields: {
      ...state.fields,
      [fieldID]: field
    }
  };

  return state;
};

const initReducer = () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = recalcChildValue(state, fieldID);

  return recalcValue(state, field.parentID, field.id);
};

const unmountReducer = () => (state, { fieldID }) => {
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

const submitStartReducer = () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  if (field.submitting) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        submitting: true
      }
    }
  };

  return state;
};

const submitReducer = () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        submitted: field.submitted + 1,
        submitting: false
      }
    }
  };

  return state;
};

const submitOkStartReducer = () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        submitting: false,
        submitSuccess: true,
        submitFailed: false,
        submitted: field.submitted + 1
      }
    }
  };

  return state;
};

const submitFailedReducer = () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        submitting: false,
        submitSuccess: false,
        submitFailed: true,
        submitted: field.submitted + 1
      }
    }
  };

  return state;
};

const focusReducer = () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        active: true,
        activated: true
      }
    }
  };

  return recalcActivity(state, field.parentID, field.id);
};

const blurReducer = () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        active: false
      }
    }
  };

  return recalcActivity(state, field.parentID, field.id);
};

const touchReducer = () => (state, { fieldID }) => {
  const field = state.fields[fieldID];

  if (field.touched) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        touched: true
      }
    }
  };

  return state;
};

const resetReducer = () => (state, { fieldID }) => {
  logWarn('reset reducer has not implemented yet');
  return state;
};

const changeValueReducer = () => (state, { fieldID, payload: value }) => {
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
  [SUBMIT_OK]: submitOkStartReducer(),
  [SUBMIT_FAILED]: submitFailedReducer(),
  [FOCUS]: focusReducer(),
  [BLUR]: blurReducer(),
  [TOUCH]: touchReducer(),
  [CHANGE_VALUE]: changeValueReducer(),
  [CHANGE_VALIDITY]: changeValidityReducer(),
  [RENAME]: renameReducer(),
  [FORMAT_EXCEPTION]: exceptionReducer('hasFormatException'),
  [NORMALIZE_EXCEPTION]: exceptionReducer('hasNormalizeException'),
  [VALIDATE_EXCEPTION]: exceptionReducer('hasValidateException')
});