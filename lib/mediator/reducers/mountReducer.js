import { SHARE } from '../../utils/const';



export default () =>
  (
    state,
    {
      fieldID,
      payload: {
        parentID = null,
        autoClean = false,
        type, simple = false,
        share = SHARE.ALL,
        value = undefined,
        name = null
      }
    }
  ) => {
    const field = {
      // permanent
      id: fieldID,
      parentID,
      autoClean,
      share,
      simple, // if true component might have named children
      type,

      // free transform
      name,

      value,

      meta: {
        valid: true,
        touched: false,

        active: false,
        activated: false,

        submitted: false,
        submitting: false,
        submitFailed: false,
        submitSuccess: false,
        submittedTimes: 0,

        error: null,
        errorsIn: [],
        hasException: false,
        hasFormatException: false,
        hasNormalizeException: false,
        hasValidateException: false
      },

      children: [],
      version: 0,
      metaVersion: 0,
      propsVersion: 0,
      valueVersion: 0
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
