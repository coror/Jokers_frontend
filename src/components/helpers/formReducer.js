const formReducer = (state, action) => { // action is dispatched by me in the code, and state is the last state snapshot
  if (action.type === 'UPDATE_FIELD') {
    return {
      ...state,
      [action.field]: action.value,
    };
  }
  if (action.type === 'RESET_FORM') {
    return {
      name: '',
      surname: '',
      email: '',
      password: '',
      groupName: '',
      roleName: '',
      userScore: '',
    };
  }
  return state;
};

export default formReducer;
