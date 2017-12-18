import set from './set';



const CHANGE_VALUE = 'CHANGE_VALUE';
const CHANGE_FIELD_VALUE = 'CHANGE_FIELD_VALUE';
const CHANGE_LOCAL_ERROR = 'CHANGE_LOCAL_ERROR';
const CHANGE_FOREIGN_ERROR = 'CHANGE_FOREIGN_ERROR';
const CHANGE_CHILD_META = 'CHANGE_CHILD_META';
const REMOVE_CHILD_META = 'REMOVE_CHILD_META';
const SUBMIT_PENDING = 'SUBMIT_PENDING';
const SUBMIT_DONE = 'SUBMIT_DONE';
const SUBMIT_FAILED = 'SUBMIT_FAILED';
const SUBMIT = 'SUBMIT';
const TOUCH = 'TOUCH';



const isNot = (value) => (itemValue) => itemValue !== value;

const actionCreator = (type, payloadFactory = () => null) => (...args) => ({ type, payload: payloadFactory(...args) });


export const changeValueActionCreator = actionCreator(CHANGE_VALUE, (value) => value);

export const changeValueFieldActionCreator = actionCreator(CHANGE_FIELD_VALUE, (name, value) => ({ name, value }));

export const changeLocalErrorActionCreator = actionCreator(CHANGE_LOCAL_ERROR, (error) => error || '');

export const changeForeignErrorActionCreator = actionCreator(CHANGE_FOREIGN_ERROR, (error) => error || '');

export const changeChildFieldMetaActionCreator = actionCreator(CHANGE_CHILD_META, (name, valid) => ({ name, valid }));

export const removeChildFieldMetaActionCreator = actionCreator(REMOVE_CHILD_META, (name) => name);

export const submitFailedActionCreator = actionCreator(SUBMIT_FAILED, (errorsObj) => errorsObj);

export const submitPendingActionCreator = actionCreator(SUBMIT_PENDING);

export const submitDoneActionCreator = actionCreator(SUBMIT_DONE);

export const submitActionCreator = actionCreator(SUBMIT);

export const touchActionCreator = actionCreator(TOUCH);



const reducersMap = {
  [CHANGE_VALUE]: (state, { payload: value }) => {
    if (value === state.value) { // TODO: support object equality
      return state;
    }

    return {
      ...state,
      value,
      version: state.version + 1
    };
  },

  [CHANGE_FIELD_VALUE]: (state, { payload: { name, value } }) => ({
    ...state,
    version: state.version + 1,
    value: set(state.value, name, value)
  }),

  [CHANGE_FOREIGN_ERROR]: (state, { payload: foreignError }) => {
    if (state.foreignError === foreignError) {
      return state;
    }

    return {
      ...state,
      foreignError,
      version: state.version + 1
    };
  },

  [REMOVE_CHILD_META]: (state, { payload }) => ({
    ...state,
    version: state.version + 1,
    invalidChildren: state.invalidChildren.filter(isNot(payload))
  }),

  [CHANGE_CHILD_META]: (state, { payload: { name, valid } }) => {
    const invalidChildren = state.invalidChildren;
    const storedValid = !invalidChildren.includes(name);

    if (storedValid === valid) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      invalidChildren: valid ? invalidChildren.filter(isNot(name)) : invalidChildren.concat([ name ])
    };
  },

  [CHANGE_LOCAL_ERROR]: (state, { payload: localError }) => {
    if (state.localError === localError) {
      return state;
    }

    return {
      ...state,
      localError,
      version: state.version + 1
    };
  },

  [TOUCH]: (state) => {
    if (state.touched) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      touched: true
    };
  },

  [SUBMIT]: (state) => {
    if (state.submitted) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      submitted: true
    };
  },

  [SUBMIT_PENDING]: (state) => {
    if (state.submitting) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      submitting: true
    };
  },

  [SUBMIT_DONE]: (state) => {
    if (!state.submitting && state.submitSuccess) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      submitSuccess: true,
      submitFailed: false,
      submitting: false,
      submitErrors: null
    };
  },

  [SUBMIT_FAILED]: (state, { payload }) => {
    if (!state.submitting && state.submitFailed) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      submitSuccess: false,
      submitFailed: true,
      submitting: false,
      submitErrors: payload
    };
  }
};


export default (
  state = {
    version: 0,
    value: undefined,
    touched: false,
    localError: '',
    foreignError: '',
    invalidChildren: [],

    submitSuccess: true,
    submitFailed: false,
    submitting: false,
    submitErrors: null,
    submitted: false
  },
  action
) => reducersMap.hasOwnProperty(action.type) ? reducersMap[action.type](state, action) : state;
