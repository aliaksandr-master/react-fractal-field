

export default (initialState, actionReducersMap) =>
  (state = initialState, action) =>
    actionReducersMap.hasOwnProperty(action.type) ? actionReducersMap[action.type](state, action) : state;
