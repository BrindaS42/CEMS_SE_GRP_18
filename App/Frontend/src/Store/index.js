import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice.js';
import eventsReducer from './event.slice.js';
import organizerReducer from './profile.slice.js';
import teamReducer from './team.slice.js';
import mapAnnotatorReducer from './map_annotator.slice.js';
import studentReducer from './student.slice.js';
import registrationReducer from './registration.slice.js';
import sponsorReducer from './sponsor.slice.js';
import aiReducer from './ai.slice.js';
import studentEventsReducer from './studentEvents.slice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    organizer: organizerReducer,
    team: teamReducer,
    mapAnnotator: mapAnnotatorReducer,
    student: studentReducer,
    registration: registrationReducer,
    sponsor: sponsorReducer,
    ai: aiReducer,
    studentEvents: studentEventsReducer,
  },
});

export default store;
