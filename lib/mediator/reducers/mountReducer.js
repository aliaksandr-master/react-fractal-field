import mkField from '../mkField';



export default () =>
  (
    state,
    {
      fieldID,
      payload: {
        parentID,
        autoClean,
        complexValueType,
        shareMeta,
        shareValue,
        value,
        name
      }
    }
  ) => {
    const field = mkField({
      id: fieldID,
      parentID,
      autoClean,
      shareMeta,
      shareValue,
      complexValueType,
      name,
      value
    });

    state = {
      ...state,
      [field.id]: field
    };

    if (field.parentID) {
      const parent = state[field.parentID];

      if (parent) {
        state = {
          ...state,
          [field.parentID]: {
            ...parent,
            version: parent.version + 1,
            children: [
              ...parent.children,
              field.id
            ]
          }
        };
      }
    }

    return state;
  };
