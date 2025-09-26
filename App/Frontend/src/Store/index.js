import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice.js';
import organizerReducer from './profile/organizer.slice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    organizer: organizerReducer,
  },
});

export default store;


