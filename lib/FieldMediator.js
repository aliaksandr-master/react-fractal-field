import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import wrapDestroyed from './wrapDestroyed';
import Store from './Store';
import PrimitiveEE from './PrimitiveEE';
import { TYPE } from './const';



const MOUNT = 'MOUNT';
const UNMOUNT = 'UNMOUNT';
const RENAME = 'RENAME';
const CHANGE_VALUE = 'CHANGE_VALUE';
const CHANGE_VALIDITY = 'CHANGE_VALIDITY';
const FORMAT_EXCEPTION = 'FORMAT_EXCEPTION';
const NORMALIZE_EXCEPTION = 'NORMALIZE_EXCEPTION';
const VALIDATE_EXCEPTION = 'VALIDATE_EXCEPTION';
const SUBMIT_START = 'SUBMIT_START';
const SUBMIT_FAILED = 'SUBMIT_FAILED';
const SUBMIT_OK = 'SUBMIT_OK';
const FOCUS = 'FOCUS';
const BLUR = 'BLUR';
const TOUCH = 'TOUCH';



const recursiveRecalc = (func, { skipIsolated = false, debug = false } = {}) => {
  const apply = (state, fieldID) => {
    const field = state.fields[fieldID];

    if (!field) {
      if (debug) {
        console.log(33333, 'EMPTY', fieldID);
      }
      return state;
    }

    const newState = func(state, field);

    if (newState === state) {
      if (debug) {
        console.log(33333, 'state is equal', field.id);
      }
      return state;
    }

    if (!skipIsolated && field.isolated) {
      if (debug) {
        console.log(33333, 'isolated or name is empty', field.id);
      }
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

  if (valid) {
    valid = state.tree[field.id].every((childID) => state.fields[childID].valid);
  }

  if (valid === field.valid) {
    return state;
  }

  return {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        valid
      }
    }
  };
});

const recalcActivity = recursiveRecalc((state, field) => {
  const someChildIsActive = state.tree[field.id].some((childID) => state.fields[childID].active);

  console.log(someChildIsActive);

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
});

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
}, { skipIsolated: true });

const exceptionProps = [ 'hasFormatException', 'hasNormalizeException', 'hasValidateException' ];

const exceptionReducer = (propName) => (state, { fieldID, payload: exception }) => {
  const field = state.fields[fieldID];

  exception = Boolean(exception);

  if (field[propName] === exception) {
    return state;
  }

  const hasException = exception || exceptionProps.filter((prop) => prop !== propName).some(Boolean);

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        valid: Boolean(field.valid && !exception),
        hasException,
        [propName]: Boolean(exception)
      }
    }
  };

  return recalcValidity(state, field.parentID);
};


const reducersByType = {
  [MOUNT]: (state, { fieldID, payload: { parentID, name = null, ...params } }) => {
    const field = {
      id: fieldID,
      name,
      error: null,
      valid: true,
      isolated: false,
      value: undefined,
      touched: false,
      active: false,
      activated: false,
      submitted: false,
      submitting: false,
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
        [parentID]: state.tree[parentID] ? [ ...state.tree[parentID], fieldID ] : [ fieldID ],
        [fieldID]: []
      },
      fields: {
        ...state.fields,
        [fieldID]: field
      }
    };

    return recalcValue(state, parentID);
  },
  [UNMOUNT]: (state, { fieldID }) => {
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
  },
  [SUBMIT_START]: (state, { fieldID }) => {
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
  },
  [SUBMIT_OK]: (state, { fieldID }) => {
    const field = state.fields[fieldID];

    if (field.submitted) {
      return state;
    }

    state = {
      ...state,
      fields: {
        ...state.fields,
        [fieldID]: {
          ...field,
          submitted: true
        }
      }
    };

    return state;
  },
  [SUBMIT_FAILED]: (state, { fieldID }) => {
    const field = state.fields[fieldID];

    if (field.submitted) {
      return state;
    }

    state = {
      ...state,
      fields: {
        ...state.fields,
        [fieldID]: {
          ...field,
          submitted: true
        }
      }
    };

    return state;
  },
  [FOCUS]: (state, { fieldID }) => {
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
  },
  [BLUR]: (state, { fieldID }) => {
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
  },
  [TOUCH]: (state, { fieldID }) => {
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
  },
  [CHANGE_VALUE]: (state, { fieldID, payload: value }) => {
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
  },
  [CHANGE_VALIDITY]: (state, { fieldID, payload: error }) => {
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
  },
  [RENAME]: (state, { fieldID, payload: name = null }) => {
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
  },
  [FORMAT_EXCEPTION]: exceptionReducer('hasFormatException'),
  [NORMALIZE_EXCEPTION]: exceptionReducer('hasNormalizeException'),
  [VALIDATE_EXCEPTION]: exceptionReducer('hasValidateException')
};

export default class FractalMediator {

  constructor (id, parent = null, settings = {}) {
    this.id = id;
    this._parent = parent;
    this._destroyed = false;
    this._localSettings = settings;
    this._formSettings = parent ? parent.settings : settings;

    this.store = parent ? parent.store : new Store({
      fields: {},
      tree: {}
    }, reducersByType);

    this.flushInitTransaction = this.transaction();

    this.destroy = wrapDestroyed(this.destroy);
    this.onChange = wrapDestroyed(this.onChange, () => () => {});
    this.transaction = wrapDestroyed(this.transaction, () => () => {});
  }

  mount (params = {}) {
    const parentID = this._parent ? this._parent.id : null;

    this._dispatch(MOUNT, { parentID, ...params });
  }

  transaction () {
    return this.store.transaction();
  }

  init () {
    this.flushInitTransaction();
  }

  getState () {
    return this.store.getState().fields[this.id];
  }

  _dispatch (type, payload) {
    const flush = this.transaction();
    const label = `DISPATCH "${type}" (ID ${this.id}):`;

    this.store.dispatch(({ type, fieldID: this.id, payload }));

    console.group(label);
    //console.groupCollapsed(label);

    console.log('old state', this.store.getState());

    console.log('action', type, payload);

    console.log('new state', this.store.getState());

    console.groupEnd(label);

    flush();
  }

  destroy () {
    this._dispatch(UNMOUNT);
    this._destroyed = true;
  }

  focus () {
    this._dispatch(FOCUS);
  }

  blur () {
    this._dispatch(BLUR);
  }

  touch () {
    this._dispatch(TOUCH);
  }

  submitStart () {
    this._dispatch(SUBMIT_START);
  }

  submitDone () {
    this._dispatch(SUBMIT_OK);
  }

  submitFailed () {
    this._dispatch(SUBMIT_FAILED);
  }

  sysNormalizeError (err) {
    this._dispatch(NORMALIZE_EXCEPTION, err);
    if (err) {
      console.error(err, 'in normalize function');
    }
  }

  sysFormatError (err) {
    this._dispatch(FORMAT_EXCEPTION, err);
    if (err) {
      console.error(err, 'in format function');
    }
  }

  sysValidateError (err) {
    this._dispatch(VALIDATE_EXCEPTION, err);
    if (err) {
      console.error(err, 'in validate function');
    }
  }

  changeValidity (error) {
    this._dispatch(CHANGE_VALIDITY, error || null);
  }

  onChange (listener) {
    return this.store.onChange(listener);
  }

  rename (name) {
    this._dispatch(RENAME, name);
  }

  changeValue (value) {
    const flush = this.transaction();

    this._dispatch(CHANGE_VALUE, value);
    this._dispatch(TOUCH);

    flush();
  }
}
