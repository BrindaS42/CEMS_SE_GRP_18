import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice.js';
import eventsReducer from './event.slice.js';
import organizerReducer from './profile/organizer.slice.js';
import teamReducer from './team.slice.js';
import mapAnnotatorReducer from './map_annotator.slice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    organizer: organizerReducer,
    team: teamReducer,
    mapAnnotator: mapAnnotatorReducer,

  },
});

export default store;

