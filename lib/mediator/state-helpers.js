import every from 'lodash/every';
import isEqual from 'lodash/isEqual';
import { SHARE } from '../utils/const';


export const getChildrenOfField = (state, field) => {
  if (!field) {
    return [];
  }

  return state.tree[field.id] || [];
};



export const getField = (state, fieldID) =>
  state.fields[fieldID];



export const updateField = (state, field, props) => {
  if (!field) {
    return state;
  }

  const allIsEqual = every(props, (prop, propName) => isEqual(prop, field[propName]));

  if (allIsEqual) {
    return state;
  }

  return {
    ...state,
    fields: {
      ...state.fields,
      [field.id]: {
        ...field,
        ...props
      }
    }
  };
};



export const hasShareLevelChecker = (shareLevel) => {
  if (shareLevel === SHARE.ALL) {
    return (share) => share !== SHARE.NONE;
  }

  if (shareLevel === SHARE.META) {
    return (share) => share === SHARE.ALL || share === SHARE.META;
  }

  if (shareLevel === SHARE.VALUE) {
    return (share) => share === SHARE.ALL || share === SHARE.VALUE;
  }

  return () => false;
};




export const recursiveRecalcInSurface = (func, { share = SHARE.ALL } = {}) => {
  const shareIsCorrect = hasShareLevelChecker(share);

  const apply = (state, fieldID, childID = null) => {
    if (childID) {
      const field = state.fields[childID];

      if (field && !shareIsCorrect(field.share)) {
        return state;
      }
    }

    const field = state.fields[fieldID];

    if (!field) {
      return state;
    }

    const prevState = state;

    state = func(state, field);

    if (prevState === state) {
      return state;
    }

    return apply(state, field.parentID, field.id);
  };

  return apply;
};



export const recursiveRecalcInDepth = (func, { share = SHARE.ALL } = {}) => {
  const shareIsCorrect = hasShareLevelChecker(share);

  const apply = (state, fieldID) => {
    const field = state.fields[fieldID];

    if (!field) {
      return state;
    }

    state.tree[fieldID].forEach((childID) => {
      const child = state.fields[childID];

      if (!child) {
        return;
      }

      if (child.name === null) {
        return;
      }

      if (!shareIsCorrect(child.share)) {
        return;
      }

      state = func(state, child);

      state = apply(state, childID);
    });

    return state;
  };

  return apply;
};

