import { configureStore} from '@reduxjs/toolkit';
import organizerReducer from './profile/organizer.slice';

export const store = configureStore({
  reducer: {
    // We are telling the store that we have a slice named 'organizer',
    // and its logic is handled by the organizerReducer we imported.
    organizer: organizerReducer,
  },
});