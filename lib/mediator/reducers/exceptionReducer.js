import recalcValidity from '../recalcValidity';




const exceptionPropsMap = [ 'hasFormatException', 'hasNormalizeException', 'hasValidateException' ]
  .reduce((result, value, _i, array) => ({
    ...result,
    [value]: array.filter((v) => v !== value)
  }), {});


export default (exceptionPropName) => (state, { fieldID, payload: exception }) => {
  const field = state.fields[fieldID];

  exception = Boolean(exception);

  if (field.meta[exceptionPropName] === exception) {
    return state;
  }

  const hasException = exception || exceptionPropsMap[exceptionPropName].some((key) => field.meta[key]);

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        meta: {
          ...field.meta,
          valid: field.meta.valid && !exception,
          hasException,
          [exceptionPropName]: exception
        }
      }
    }
  };

  return recalcValidity(state, field.parentID, field.id);
};
