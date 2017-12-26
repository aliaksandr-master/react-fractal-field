import { SHARE } from '../../utils/const';

export default () => (state, { fieldID, payload: { parentID, name = null, ...params } }) => {
  const field = {
    id: fieldID,
    parentID,
    share: SHARE.ALL,
    simple: false, // if true component might have named children

    name,

    value: undefined,

    version: 0,
    metaVersion: 0,
    propsVersion: 0,
    valueVersion: 0,

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
