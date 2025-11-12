import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import eventsReducer from './slices/eventsSlice.js';
import messagesReducer from './slices/messagesSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    messages: messagesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
