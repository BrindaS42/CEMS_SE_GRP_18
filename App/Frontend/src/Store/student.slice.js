import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Student dashboard actions
export const fetchRegisteredEvents = createAsyncThunk('student/fetchRegisteredEvents', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/student-dashboard/my-registered-events`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load registered events')
  }
})

export const fetchCompletedEvents = createAsyncThunk('student/fetchCompletedEvents', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/student-dashboard/my-completed-events`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load completed events')
  }
})

export const fetchTimelineReminders = createAsyncThunk('student/fetchTimelineReminders', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/student-dashboard/timeline-reminders`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load reminders')
  }
})

export const fetchClashWarnings = createAsyncThunk('student/fetchClashWarnings', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/student-dashboard/clash-warnings`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load clash warnings')
  }
})

export const fetchStudentTeams = createAsyncThunk('student/fetchStudentTeams', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/student-dashboard/my-teams`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load student teams')
  }
})

const initialState = {
  registeredEvents: [],
  completedEvents: [],
  timelineReminders: [],
  clashWarnings: [],
  studentTeams: [],
  loading: false,
  error: null,
}

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegisteredEvents.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchRegisteredEvents.fulfilled, (state, action) => { state.loading = false; state.registeredEvents = action.payload })
      .addCase(fetchRegisteredEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchCompletedEvents.fulfilled, (state, action) => { state.completedEvents = action.payload })
      .addCase(fetchTimelineReminders.fulfilled, (state, action) => { state.timelineReminders = action.payload })
      .addCase(fetchClashWarnings.fulfilled, (state, action) => { state.clashWarnings = action.payload })
      .addCase(fetchStudentTeams.fulfilled, (state, action) => { state.studentTeams = action.payload })
  }
})

export default studentSlice.reducer
