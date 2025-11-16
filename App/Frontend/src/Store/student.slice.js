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
    const res = await axios.get(`${API_BASE}/student-dashboard/my-teams`);
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load student teams')
  }
})

export const fetchAllStudents = createAsyncThunk('student/fetchAllStudents', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/student/teams/all-students`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to load students');
  }
});

// Student Team CRUD actions
export const createStudentTeam = createAsyncThunk('student/createStudentTeam', async (teamData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/student/teams/create`, teamData);
    return res.data.team;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to create team');
  }
});

export const updateStudentTeam = createAsyncThunk('student/updateStudentTeam', async ({ teamId, updatedData }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`${API_BASE}/student/teams/${teamId}`, updatedData);
    return res.data.team;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to update team');
  }
});

export const deleteStudentTeam = createAsyncThunk('student/deleteStudentTeam', async (teamId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_BASE}/student/teams/${teamId}`);
    return teamId;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to delete team');
  }
});


const initialState = {
  registeredEvents: [],
  completedEvents: [],
  timelineReminders: [],
  clashWarnings: [],
  studentTeams: {
    leader: [],
    member: [],
  },
  allStudents: [],
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
      .addCase(fetchRegisteredEvents.fulfilled, (state, action) => { state.loading = false; state.registeredEvents = action.payload.data || [] })
      .addCase(fetchRegisteredEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchCompletedEvents.fulfilled, (state, action) => { state.completedEvents = action.payload.data || [] })
      .addCase(fetchTimelineReminders.fulfilled, (state, action) => { state.timelineReminders = action.payload })
      .addCase(fetchClashWarnings.fulfilled, (state, action) => { state.clashWarnings = action.payload })
      .addCase(fetchStudentTeams.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStudentTeams.fulfilled, (state, action) => { state.loading = false; state.studentTeams = action.payload; })
      .addCase(fetchStudentTeams.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // All students reducers
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.allStudents = action.payload;
      })
      // Team CRUD reducers
      .addCase(createStudentTeam.fulfilled, (state, action) => {
        state.studentTeams.leader.push(action.payload);
      })
      .addCase(updateStudentTeam.fulfilled, (state, action) => {
        const index = state.studentTeams.leader.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.studentTeams.leader[index] = action.payload;
        }
      })
      .addCase(deleteStudentTeam.fulfilled, (state, action) => {
        state.studentTeams.leader = state.studentTeams.leader.filter(t => t._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('student/'),
        (state, action) => {
          if (action.type.includes('Team')) { // Only set error for team actions
            state.error = action.payload;
          }
        }
      );
  }
})

export default studentSlice.reducer
