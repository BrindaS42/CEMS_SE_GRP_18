import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const fetchAllEvents = createAsyncThunk('studentEvents/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/event-show`); // This might need to be updated based on your public event route
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load events');
  }
});

export const fetchPublicEvents = createAsyncThunk('studentEvents/fetchPublic', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`${API_BASE}/event-show?${query}`);
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load events')
  }
})

export const fetchEventDetails = createAsyncThunk('studentEvents/fetchDetails', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/event-show/${eventId}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load event details')
  }
})

export const fetchEventAnnouncements = createAsyncThunk('studentEvents/fetchAnnouncements', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/event-show/${eventId}/announcements`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load announcements')
  }
})

export const fetchEventSponsors = createAsyncThunk('studentEvents/fetchSponsors', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/event-show/${eventId}/sponsors`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load sponsors')
  }
})

export const fetchEventReviews = createAsyncThunk('studentEvents/fetchReviews', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/event-show/${eventId}/reviews`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load reviews')
  }
})

export const addEventRating = createAsyncThunk('studentEvents/addRating', async ({ eventId, rating }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/event-show/${eventId}/rate`, rating)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to add rating')
  }
})

export const checkInToEvent = createAsyncThunk('studentEvents/checkIn', async ({ eventId, checkInData }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/event-show/${eventId}/checkin`, checkInData)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to check in')
  }
})

const initialState = {
  events: [],
  pagination: {},
  currentEvent: null,
  announcements: [],
  sponsors: [],
  reviews: [],
  loading: false,
  error: null,
}

const studentEventsSlice = createSlice({
  name: 'studentEvents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEvents.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAllEvents.fulfilled, (state, action) => { state.loading = false; state.events = action.payload.events || [] })
      .addCase(fetchAllEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchPublicEvents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPublicEvents.fulfilled, (state, action) => { state.loading = false; state.events = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchPublicEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })      .addCase(fetchEventDetails.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEventDetails.fulfilled, (state, action) => { state.loading = false; state.currentEvent = action.payload.event; })      .addCase(fetchEventDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchEventAnnouncements.fulfilled, (state, action) => { state.announcements = action.payload })
      .addCase(fetchEventSponsors.fulfilled, (state, action) => { state.sponsors = action.payload.sponsors || [] })
      .addCase(fetchEventReviews.fulfilled, (state, action) => { state.reviews = action.payload.reviews || [] })
      .addCase(addEventRating.fulfilled, (state, action) => {
        if (Array.isArray(state.reviews)) {
          state.reviews.push(action.payload.ratings.pop()); // Add the newest review
        }
      })
  }
})

export default studentEventsSlice.reducer