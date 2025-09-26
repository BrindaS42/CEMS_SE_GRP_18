import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice.js';
import eventsReducer from './event.slice.js';
import organizerReducer from './profile/organizer.slice.js';


const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    organizer: organizerReducer,
  },
});

export default store;


