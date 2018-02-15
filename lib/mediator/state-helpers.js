import { every, isEqual } from '../utils/lodash';



export const updateFieldProps = (state, field, props) => {
  if (!field) {
    return state;
  }

  const allIsEqual = every(props, (prop, propName) => isEqual(prop, field[propName]));

  if (allIsEqual) {
    return state;
  }

  return {
    ...state,
    [field.id]: {
      ...field,
      ...props,
      version: field.version + 1
    }
  };
};



export const updateFieldValue = (state, field, value) => {
  if (!field) {
    return state;
  }

  if (isEqual(value, field.value)) {
    return state;
  }

  return {
    ...state,
    [field.id]: {
      ...field,
      value,
      version: field.version + 1,
      valueVersion: field.valueVersion + 1
    }
  };
};



export const updateFieldMeta = (state, field, meta) => {
  if (!field) {
    return state;
  }

  const allIsEqual = every(meta, (prop, key) => isEqual(prop, field.meta[key]));

  if (allIsEqual) {
    return state;
  }

  return {
    ...state,
    [field.id]: {
      ...field,
      meta: {
        ...field.meta,
        ...meta
      },
      version: field.version + 1,
      metaVersion: field.metaVersion + 1
    }
  };
};



export const hasShareLevelChecker = (shareMeta = null, shareValue = null) => {
  if (shareValue === null && shareMeta === null) {
    return () => true;
  }

  if ((shareMeta !== null && shareValue !== null)) {
    return (field) => field.shareMeta === shareMeta && field.shareValue === shareValue;
  }

  if (shareMeta === null) {
    return (field) => field.shareValue === shareValue;
  }

  if (shareValue === null) {
    return (field) => field.shareMeta === shareMeta;
  }

  return () => false;
};


export const recursiveRecalcInSurface = (func, { shareMeta = null, shareValue = null } = {}) => {
  const shareIsCorrect = hasShareLevelChecker(shareMeta, shareValue);

  const apply = (state, fieldID, childID = null, level, params) => {
    if (childID) {
      const field = state[childID];

      if (field && !shareIsCorrect(field)) {
        return state;
      }
    }

    const field = state[fieldID];

    if (!field) {
      return state;
    }

    const prevState = state;

    state = func(state, field, level, ...params);

    if (prevState === state) {
      return state;
    }

    return apply(state, field.parentID, field.id, level + 1, params);
  };

  return (state, fieldID, childID, ...params) => apply(state, fieldID, childID, 0, params);
};



export const recursiveRecalcInDepth = (func, { shareMeta = null, shareValue = null } = {}) => {
  const shareIsCorrect = hasShareLevelChecker(shareMeta, shareValue);

  const apply = (state, fieldID, level, params) => {
    const field = state[fieldID];

    if (!field) {
      return state;
    }

    state[fieldID].children.forEach((childID) => {
      const child = state[childID];

      if (!child) {
        return;
      }

      if (child.name === null) {
        return;
      }

      if (!shareIsCorrect(child)) {
        return;
      }

      state = func(state, child, ...params);

      state = apply(state, childID, level + 1, params);
    });

    return state;
  };

  return (state, fieldID, ...params) => apply(state, fieldID, 0, params);
};

