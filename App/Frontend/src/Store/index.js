import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice.js';
import eventsReducer from './event.slice.js';
import teamReducer from './team.slice.js';
import mapAnnotatorReducer from './map_annotator.slice.js';
import studentReducer from './student.slice.js';
import registrationReducer from './registration.slice.js';
import sponsorReducer from './sponsor.slice.js';
import aiReducer from './ai.slice.js';
import studentEventsReducer from './studentEvents.slice.js';
import inboxReducer from './inbox.slice.js';
import eventInteractionReducer from './event.interaction.slice.js';
import socketReducer from './socket.slice.js';
import collegeReducer from './college.slice.js';
import adminReducer from './admin.slice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    team: teamReducer,
    mapAnnotator: mapAnnotatorReducer,
    student: studentReducer,
    registration: registrationReducer,
    sponsor: sponsorReducer,
    ai: aiReducer,
    studentEvents: studentEventsReducer,
    inbox: inboxReducer,
    eventInteraction: eventInteractionReducer,
    socket: socketReducer,
    college: collegeReducer,
    admin: adminReducer,
  },
});

export default store;
