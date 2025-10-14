// eventsSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentEvents: [
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      date: "March 15, 2024 - Today",
      location: "Main Auditorium",
      attendees: 450,
      status: "current",
      image: "https://images.unsplash.com/photo-1613687969216-40c7b718c025?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdW5pdmVyc2l0eSUyMGV2ZW50fGVufDF8fHx8MTc1ODg2NTk4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Annual technology summit featuring industry leaders discussing AI, blockchain, and future innovations."
    },
    {
      id: 2,
      title: "Cultural Night Celebration",
      date: "March 14, 2024 - Ongoing",
      location: "Campus Grounds",
      attendees: 320,
      status: "current",
      image: "https://images.unsplash.com/photo-1613687969216-40c7b718c025?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdW5pdmVyc2l0eSUyMGV2ZW50fGVufDF8fHx8MTc1ODg2NTk4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Multi-day cultural celebration showcasing diverse traditions, performances, and cuisines from around the world."
    }
  ],
  upcomingEvents: [
    {
      id: 3,
      title: "Spring Career Fair",
      date: "March 22, 2024",
      location: "Student Center",
      attendees: 200,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1613687969216-40c7b718c025?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdW5pdmVyc2l0eSUyMGV2ZW50fGVufDF8fHx8MTc1ODg2NTk4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Connect with top employers and explore internship and full-time opportunities across various industries."
    },
    {
      id: 4,
      title: "Research Symposium",
      date: "March 28, 2024",
      location: "Science Building",
      attendees: 150,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1613687969216-40c7b718c025?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdW5pdmVyc2l0eSUyMGV2ZW50fGVufDF8fHx8MTc1ODg2NTk4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Annual showcase of undergraduate and graduate research projects across all academic departments."
    },
    {
      id: 5,
      title: "Alumni Homecoming",
      date: "April 5, 2024",
      location: "Campus Wide",
      attendees: 800,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1613687969216-40c7b718c025?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdW5pdmVyc2l0eSUyMGV2ZW50fGVufDF8fHx8MTc1ODg2NTk4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Welcome back alumni for a weekend of networking, campus tours, and celebration of achievements."
    }
  ],
  loading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEventsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setEventsError: (state, action) => {
      state.error = action.payload;
    },
    setCurrentEvents: (state, action) => {
      state.currentEvents = action.payload;
    },
    setUpcomingEvents: (state, action) => {
      state.upcomingEvents = action.payload;
    },
    addEvent: (state, action) => {
      if (action.payload.status === 'current') {
        state.currentEvents.push(action.payload);
      } else {
        state.upcomingEvents.push(action.payload);
      }
    },
    updateEvent: (state, action) => {
      const event = action.payload;
      if (event.status === 'current') {
        const index = state.currentEvents.findIndex(e => e.id === event.id);
        if (index !== -1) {
          state.currentEvents[index] = event;
        }
      } else {
        const index = state.upcomingEvents.findIndex(e => e.id === event.id);
        if (index !== -1) {
          state.upcomingEvents[index] = event;
        }
      }
    },
    deleteEvent: (state, action) => {
      state.currentEvents = state.currentEvents.filter(e => e.id !== action.payload);
      state.upcomingEvents = state.upcomingEvents.filter(e => e.id !== action.payload);
    },
  },
});

export const {
  setEventsLoading,
  setEventsError,
  setCurrentEvents,
  setUpcomingEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} = eventsSlice.actions;

export default eventsSlice.reducer;