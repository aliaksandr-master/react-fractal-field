import some from 'lodash/some';
import set from './set';

const CHANGE_VALUE = 'CHANGE_VALUE';
const CHANGE_FIELD_VALUE = 'CHANGE_FIELD_VALUE';
const CHANGE_LOCAL_ERROR = 'CHANGE_LOCAL_ERROR';
const CHANGE_FOREIGN_ERROR = 'CHANGE_FOREIGN_ERROR';
const CHANGE_CHILD_META = 'CHANGE_CHILD_META';
const SET_TOUCH = 'SET_TOUCH';
const SET_UNTOUCH = 'SET_UNTOUCH';
const CHILD_FOCUSED = 'CHILD_FOCUSED';
const SUBMIT_PENDING = 'SUBMIT_PENDING';
const SUBMIT_DONE = 'SUBMIT_DONE';
const SUBMIT_FAILED = 'SUBMIT_FAILED';
const SUBMIT = 'SUBMIT';
const TOUCH = 'TOUCH';

export const changeValueActionCreator = (value, normalizedValue) => ({
  type: CHANGE_VALUE,
  payload: { value, normalizedValue }
});

export const changeValueFieldActionCreator = (name, value) => ({
  type: CHANGE_FIELD_VALUE,
  payload: { name, value }
});

export const changeLocalErrorActionCreator = (error) => ({
  type: CHANGE_LOCAL_ERROR,
  payload: { error: error || '' }
});

export const changeForeignErrorActionCreator = (error) => ({
  type: CHANGE_FOREIGN_ERROR,
  payload: { error: error || '' }
});

export const changeChildFieldMetaActionCreator = (name, state) => ({
  type: CHANGE_CHILD_META,
  payload: { name, state }
});

export const submitFailedActionCreator = (errorsObj) => ({
  type: SUBMIT_FAILED,
  payload: errorsObj
});

export const submitPendingActionCreator = (errorsObj) => ({
  type: SUBMIT_PENDING,
  payload: {}
});

export const submitDoneActionCreator = () => ({
  type: SUBMIT_DONE,
  payload: {}
});

export const submitActionCreator = () => ({
  type: SUBMIT,
  payload: {}
});

export const touchActionCreator = () => ({
  type: TOUCH,
  payload: {}
});

export default (
  state = {
    version: 0,
    value: undefined,
    normalizedValue: undefined,
    touched: false,
    validChildren: true,
    localError: '',
    foreignError: '',
    children: {},

    submitSuccess: true,
    submitFailed: false,
    submitting: false,
    submitErrors: null,
    submitted: false
  },
  { type, payload }
) => {
  if (type === CHANGE_VALUE) {
    const { value, normalizedValue } = payload;

    return {
      ...state,
      version: state.version + 1,
      value,
      normalizedValue
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
    const { error } = payload;

    return {
      ...state,
      foreignError: error,
      version: state.version + 1
    };
  }

  if (type === CHANGE_CHILD_META) {
    const { name, state: childState } = payload;

    const valid = !childState.localError && !childState.foreignError && childState.validChildren;

    if (state.children.hasOwnProperty(name) && state.children[name].valid === valid) {
      return state;
    }

    const children = {
      ...state.children,
      [name]: valid
    };

    return ({
      ...state,
      version: state.version + 1,
      children,
      validChildren: valid && !some(children, (valid) => !valid)
    });
  }

  if (type === CHANGE_CHILD_META) {
    const { error } = payload;

    return ({
      ...state,
      localError: error,
      version: state.version + 1
    });
  }

  if (type === CHILD_FOCUSED) {
    return ({
      ...state,
      version: state.version + 1,
      focused: true
    });
  }

  if (type === SET_TOUCH) {
    return ({
      ...state,
      version: state.version + 1,
      touched: true
    });
  }

  if (type === SET_UNTOUCH) {
    return ({
      ...state,
      version: state.version + 1,
      touched: false
    });
  }

  if (type === TOUCH) {
    return ({
      ...state,
      version: state.version + 1,
      touched: true
    });
  }

  if (type === SUBMIT) {
    return ({
      ...state,
      version: state.version + 1,
      submitted: true
    });
  }

  if (type === SUBMIT_PENDING) {
    return ({
      ...state,
      version: state.version + 1,
      submitting: true
    });
  }

  if (type === SUBMIT_DONE) {
    return ({
      ...state,
      version: state.version + 1,
      submitSuccess: true,
      submitFailed: false,
      submitting: false,
      submitErrors: null
    });
  }

  if (type === SUBMIT_FAILED) {
    return ({
      ...state,
      version: state.version + 1,
      submitSuccess: false,
      submitFailed: true,
      submitting: false,
      submitErrors: payload
    });
  }

  return state;
};
