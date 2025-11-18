import { createSlice } from '@reduxjs/toolkit';

// Get user info from localStorage if it exists
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // This action will run when a user logs in or registers
    setCredentials(state, action) {
      state.userInfo = action.payload;
      // Save the user info to local storage
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    // This action will run when a user logs out
    logout(state) {
      state.userInfo = null;
      // Remove the user info from local storage
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;