const loogedReducer = (state = true, action) => {
  switch (action.type) {
    case "Log":
      return (state = true);
    case "UnLog":
      return (state = false);
    default:
      return state;
  }
};
export default loogedReducer;