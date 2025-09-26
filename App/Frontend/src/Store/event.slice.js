import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const fetchDashboardEvents = createAsyncThunk('events/fetchDashboardAll', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load events')
  }
})

export const fetchPublishedEvents = createAsyncThunk('events/fetchPublished', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events/published`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load published')
  }
})

export const fetchDraftEvents = createAsyncThunk('events/fetchDrafts', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events/drafts`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load drafts')
  }
})

export const fetchEventRegistrations = createAsyncThunk('events/fetchRegistrations', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events/${eventId}/registrations`)
    return { eventId, logs: res.data }
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load registrations')
  }
})

export const fetchEventCheckIns = createAsyncThunk('events/fetchCheckIns', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events/${eventId}/checkins`)
    return { eventId, checkIns: res.data }
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load check-ins')
  }
})

const initialState = {
  all: [],
  published: [],
  drafts: [],
  logsByEventId: {},
  checkInsByEventId: {},
  status: 'idle',
  error: null,
}

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardEvents.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchDashboardEvents.fulfilled, (state, action) => { state.status = 'succeeded'; state.all = action.payload })
      .addCase(fetchDashboardEvents.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload })
      .addCase(fetchPublishedEvents.fulfilled, (state, action) => { state.published = action.payload })
      .addCase(fetchDraftEvents.fulfilled, (state, action) => { state.drafts = action.payload })
      .addCase(fetchEventRegistrations.fulfilled, (state, action) => { state.logsByEventId[action.payload.eventId] = action.payload.logs })
      .addCase(fetchEventCheckIns.fulfilled, (state, action) => { state.checkInsByEventId[action.payload.eventId] = action.payload.checkIns })
  }
})

export default eventsSlice.reducer


