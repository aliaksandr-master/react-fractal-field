import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import Store from './Store';
import PrimitiveEE from './PrimitiveEE';
import wrapDestroyed from 'wrapDestroyed';


const MOUNT = 'MOUNT';
const UNMOUNT = 'UNMOUNT';
const RENAME_CHILD = 'RENAME_CHILD';
const CHANGE_VALUE = 'CHANGE_VALUE';
const CHANGE_VALIDITY = 'CHANGE_VALIDITY';
const RECALC_VALIDITY = 'RECALC_VALIDITY';
const SUBMIT_START = 'SUBMIT_START';
const SUBMIT_FAILED = 'SUBMIT_FAILED';
const SUBMIT_OK = 'SUBMIT_OK';
const FOCUS = 'FOCUS';
const BLUR = 'BLUR';
const TOUCH = 'TOUCH';

const recalcValidity = (state, fieldID) => {
  const field = state.fields[fieldID];

  if (!field || field.error) {
    return state;
  }

  const children = state.tree[fieldID];
  const childrenAreValid = children.every((childID) => state.fields[childID].valid);

  if (childrenAreValid === field.valid) {
    return state;
  }

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        valid: childrenAreValid
      }
    }
  };

  return recalcValidity(state, field.parentID);
};

const recalcValue = (state, fieldID) => {
  const field = state.fields[fieldID];

  if (!field) {
    return state;
  }

  const children = state.tree[fieldID];

  if (!children.length) {
    return state;
  }

  const value = children.reduce((value, childID) => {
    const child = state.fields[childID];

    if (!child.name) {
      return value;
    }

    value[child.name] = child.value;

    return value;
  }, field.array ? [] : {});

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

  if (!field.name) {
    return state;
  }

  return recalcValue(state, field.parentID);
};


const reducersByType = {
  [MOUNT]: (state, { fieldID, payload: { parentID, ...params } }) => {
    const field = {
      parentID,
      id: fieldID,
      error: null,
      valid: true,
      field: false,
      value: undefined,
      touched: false,
      active: false,
      //deepActive: false,
      //childActive: false,
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

    return recalcValidity(state, parentID);
  },
  [SUBMIT_START]: (state, { fieldID }) => {
    return state;
  },
  [SUBMIT_OK]: (state, { fieldID }) => {
    return state;
  },
  [SUBMIT_FAILED]: (state, { fieldID }) => {
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
          active: true
        }
      }
    };

    return state;
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

    return state;
  },
  [TOUCH]: (state, { fieldID }) => {
    const field = state.fields[fieldID];

    state = {
      ...state,
      fields: {
        ...state.fields,
        [fieldID]: {
          ...field,
          touch: true
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

    const valid = !error;

    state = {
      ...state,
      fields: {
        ...state.fields,
        [fieldID]: {
          ...field,
          valid,
          error
        }
      }
    };

    const newState = recalcValidity(state, field.parentID);

    if (newState === state) {
      return state;
    }

    return recalcValue(state, field.parentID);
  },
  [RENAME_CHILD]: (state, { fieldID, payload: name = null }) => {
    const field = state.fields[fieldID];

    if (field.name === name) {
      return state;
    }

    state = {
      ...state,
      fields: {
        ...state.fields,
        [fieldID]: {
          ...state.fields[fieldID],
          name
        }
      }
    };

    return recalcValue(state, field.parentID);
  }
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

    const parentID = parent ? parent.id : null;
  }

  mount (params = {}) {
    this._dispatch(MOUNT, params);
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

    console.group(label);
    //console.groupCollapsed(label);

    console.log('old state', this.store.getState());

    console.log('action', type, payload);

    this.store.dispatch(({ type, fieldID: this.id, payload }));

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

  sysNormalizeError (err, label) {
    if (err) {
      console.error(err, 'normalize');
    }
  }

  sysFormatError (err, label) {
    if (err) {
      console.error(err, 'format');
    }
  }

  sysValidateError (err, label) {
    if (err) {
      console.error(err, 'validate');
    }
  }

  changeValidity (error) {
    this._dispatch(CHANGE_VALIDITY, error || null);
  }

  onChange (listener) {
    return this.store.onChange(listener);
  }

  rename (name) {
    this._dispatch(RENAME_CHILD, name);
  }

  changeValue (value) {
    const flush = this.transaction();

    this._dispatch(CHANGE_VALUE, value);
    this._dispatch(TOUCH);

    flush();
  }
}
