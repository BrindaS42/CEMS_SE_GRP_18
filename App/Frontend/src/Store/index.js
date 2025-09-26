import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice.js';
import eventsReducer from './event.slice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
  },
});

export default store;


