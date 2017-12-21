import { SHARE } from '../../utils/const';

export default () => (state, { fieldID, payload: { parentID, name = null, ...params } }) => {
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
