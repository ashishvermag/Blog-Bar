import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer, // We're telling the store about our auth slice
  },
  devTools: true, // This enables the Redux DevTools in your browser
});

export default store;