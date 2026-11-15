import { createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
  name: "app",
  initialState: {
    user: null, // { id, username } when logged in
    authChecked: false, // true after asking the backend who is logged in
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.authChecked = true;
    },
  },
});

export const { setUser } = appSlice.actions;

export default appSlice.reducer;
