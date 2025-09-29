import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import eventsSlice from './slices/eventsSlice';
import teamSlice from './slices/teamSlice';
import profileSlice from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    events: eventsSlice,
    team: teamSlice,
    profile: profileSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;