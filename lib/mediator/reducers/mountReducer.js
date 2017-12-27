import { SHARE } from '../../utils/const';



export default () => (state, { fieldID, payload: { parentID, name = null, ...params } }) => {
  const field = {
    id: fieldID,
    parentID,
    share: SHARE.ALL,
    simple: false, // if true component might have named children
    version: 0,
    metaVersion: 0,
    propsVersion: 0,
    valueVersion: 0,
    children: [],

    name,

    value: undefined,

    meta: {
      valid: true,
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
      hasValidateException: false
    },

    ...params
  };

  state = {
    ...state,
    [fieldID]: field
  };

  if (parentID) {
    const parent = state[parentID];

    if (parent) {
      state = {
        ...state,
        [parentID]: {
          ...parent,
          children: [
            ...parent.children,
            fieldID
          ]
        }
      };
    }
  }

  return state;
};
