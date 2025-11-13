import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/auth.slice.js';
import eventsReducer from '../store/event.slice.js';
import organizerReducer from '../store/profile.slice.js';
import teamReducer from '../store/team.slice.js';
import mapAnnotatorReducer from '../store/map_annotator.slice.js';
import studentReducer from '../store/student.slice.js';
import registrationReducer from '../store/registration.slice.js';
import sponsorReducer from '../store/sponsor.slice.js';
import aiReducer from '../store/ai.slice.js';
import studentEventsReducer from '../store/studentEvents.slice.js';

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

