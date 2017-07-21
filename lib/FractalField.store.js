import set from './set';

const CHANGE_VALUE = 'CHANGE_VALUE';
const CHANGE_FIELD_VALUE = 'CHANGE_FIELD_VALUE';
const CHANGE_LOCAL_ERROR = 'CHANGE_LOCAL_ERROR';
const CHANGE_FOREIGN_ERROR = 'CHANGE_FOREIGN_ERROR';
const CHANGE_CHILD_META = 'CHANGE_CHILD_META';
const REMOVE_CHILD_META = 'REMOVE_CHILD_META';
const SET_TOUCH = 'SET_TOUCH';
const SET_UNTOUCH = 'SET_UNTOUCH';
const CHILD_FOCUSED = 'CHILD_FOCUSED';
const SUBMIT_PENDING = 'SUBMIT_PENDING';
const SUBMIT_DONE = 'SUBMIT_DONE';
const SUBMIT_FAILED = 'SUBMIT_FAILED';
const SUBMIT = 'SUBMIT';
const TOUCH = 'TOUCH';


const isNot = (value) => (itemValue) => itemValue !== value;

const actionFactory = (type, payload) => ({ type, payload });


export const changeValueActionCreator = (value) => actionFactory(CHANGE_VALUE, value);

export const changeValueFieldActionCreator = (name, value) => actionFactory(CHANGE_FIELD_VALUE, { name, value });

export const changeLocalErrorActionCreator = (error) => actionFactory(CHANGE_LOCAL_ERROR, error || '');

export const changeForeignErrorActionCreator = (error) => actionFactory(CHANGE_FOREIGN_ERROR, error || '');

export const changeChildFieldMetaActionCreator = (name, valid) => actionFactory(CHANGE_CHILD_META, { name, valid });

export const removeChildFieldMetaActionCreator = (name) => actionFactory(REMOVE_CHILD_META, name);

export const submitFailedActionCreator = (errorsObj) => actionFactory(SUBMIT_FAILED, errorsObj);

export const submitPendingActionCreator = (errorsObj) => actionFactory(SUBMIT_PENDING);

export const submitDoneActionCreator = () => actionFactory(SUBMIT_DONE);

export const submitActionCreator = () => actionFactory(SUBMIT);

export const touchActionCreator = () => actionFactory(TOUCH);

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
  { type, payload }
) => {
  if (type === CHANGE_VALUE) {
    if (payload === state.value) { // TODO: support object equality
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      value: payload
    };
  }

  if (type === CHANGE_FIELD_VALUE) {
    const { name, value } = payload;

    return {
      ...state,
      version: state.version + 1,
      value: set(state.value, name, value)
    };
  }

  if (type === CHANGE_FOREIGN_ERROR) {
    if (state.foreignError === payload) {
      return state;
    }

    return {
      ...state,
      foreignError: payload,
      version: state.version + 1
    };
  }

  if (type === REMOVE_CHILD_META) {
    return {
      ...state,
      version: state.version + 1,
      invalidChildren: state.invalidChildren.filter(isNot(payload))
    };
  }

  if (type === CHANGE_CHILD_META) {
    const { name, valid } = payload;
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
  }

  if (type === CHANGE_LOCAL_ERROR) {
    if (state.localError === payload) {
      return state;
    }

    return {
      ...state,
      localError: payload,
      version: state.version + 1
    };
  }

  if (type === CHILD_FOCUSED) {
    if (state.focused) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      focused: true
    };
  }

  if (type === TOUCH) {
    if (state.touched) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      touched: true
    };
  }

  if (type === SUBMIT) {
    if (state.submitted) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      submitted: true
    };
  }

  if (type === SUBMIT_PENDING) {
    if (state.submitting) {
      return state;
    }

    return {
      ...state,
      version: state.version + 1,
      submitting: true
    };
  }

  if (type === SUBMIT_DONE) {
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
  }

  if (type === SUBMIT_FAILED) {
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

  return state;
};
