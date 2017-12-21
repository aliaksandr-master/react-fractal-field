import recalcValidity from '../recalcValidity';


export default (propName, exceptionPropsMap) => (state, { fieldID, payload: exception }) => {
  const field = state.fields[fieldID];

  exception = Boolean(exception);

  if (field[propName] === exception) {
    return state;
  }

  const hasException = exception || exceptionPropsMap[propName].some((propName) => Boolean(field[propName]));

  state = {
    ...state,
    fields: {
      ...state.fields,
      [fieldID]: {
        ...field,
        valid: field.valid && !exception,
        hasException,
        [propName]: exception
      }
    }
  };

  return recalcValidity(state, field.parentID, field.id);
};
