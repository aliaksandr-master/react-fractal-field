import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import { TYPE, SHARE } from '../utils/const';
import reducer from './reducer';



export const MOUNT = 'MOUNT';
export const UNMOUNT = 'UNMOUNT';
export const RENAME = 'RENAME';
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



const hasShareLevel = (shareLevel) => {
  if (shareLevel === SHARE.ALL) {
    return ({ share }) => share !== SHARE.NONE;
  }

  if (shareLevel === SHARE.META) {
    return ({ share }) => share !== SHARE.NONE && share !== SHARE.VALUE;
  }

  if (shareLevel === SHARE.VALUE) {
    return ({ share }) => share !== SHARE.NONE && share !== SHARE.META;
  }

  return () => false;
};



const recursiveRecalc = (func, { skipIsolated = false, check = () => true } = {}) => {
  const apply = (state, fieldID) => {
    const field = state.fields[fieldID];

    if (!field) {
      return state;
    }

    const newState = func(state, field);

    if (newState === state) {
      return state;
    }

    if (!check(field)) {
      return state;
    }

    return apply(newState, field.parentID);
  };

  return apply;
};



const recalcValidity = recursiveRecalc((state, field) => {
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

  return {
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
}, { check: hasShareLevel(SHARE.META) });

const recalcActivity = recursiveRecalc((state, field) => {
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
}, { check: hasShareLevel(SHARE.META) });

const recalcValue = recursiveRecalc((state, field) => {
  const children = state.tree[field.id];

  const value = children.reduce((value, childID) => {
    const child = state.fields[childID];

    if (!child.name) {
      return value;
    }

    value[child.name] = child.value;

    return value;
  }, field.type === TYPE.ARRAY ? [] : {});

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
}, { check: hasShareLevel(SHARE.VALUE) });



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

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        valid: field.valid && !exception,
        hasException: exception || exceptionPropsMap[propName].some(Boolean),
        [propName]: exception
      }
    }
  };

  return recalcValidity(state, field.parentID);
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

  return recalcValue(state, field.parentID);
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

  return recalcValue(newState, field.parentID);
};

const mountReducer = () => (state, { fieldID, payload: { parentID, name = null, ...params } }) => {
  const field = {
    id: fieldID,
    name,
    valid: true,
    share: SHARE.ALL,
    value: undefined,
    touched: false,

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

  return recalcValue(state, parentID);
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

  state = recalcValidity(state, parentID);

  return recalcValue(state, parentID);
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

  return recalcActivity(state, field.parentID);
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

  return recalcActivity(state, field.parentID);
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

  return recalcValue(state, field.parentID);
};


export default reducer({
  fields: {},
  tree: {}
}, {
  [MOUNT]: mountReducer(),
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
