import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const getRegistrationForm = createAsyncThunk('registration/getForm', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/registrations/${eventId}/form`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load registration form')
  }
})

export const submitRegistration = createAsyncThunk('registration/submit', async (registrationData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/registrations/submit`, registrationData)
    return res.data
  } catch (err) {
    // Prefer 'message' for user-facing errors, fallback to 'error', then generic string
    return rejectWithValue(
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      'Failed to submit registration'
    )
  }
})

export const getRegistrationStatus = createAsyncThunk('registration/getStatus', async ({ eventId, participantId }, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/registrations/${eventId}/${participantId}/status`)
    return res.data
  } catch (err) {
    // If it's a 404, it just means the user isn't registered. Return null instead of an error.
    if (err.response && err.response.status === 404) {
      return null
    }
    return rejectWithValue(err?.response?.data?.error || 'Failed to get registration status');
  }
})

export const markCheckIn = createAsyncThunk('registration/checkIn', async (checkInData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/registrations/checkin`, checkInData)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to check in')
  }
})

const initialState = {
  form: null,
  status: null,
  loading: false,
  error: null,
}

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRegistrationForm.pending, (state) => { state.loading = true; state.error = null })
      .addCase(getRegistrationForm.fulfilled, (state, action) => { state.loading = false; state.form = action.payload })
      .addCase(getRegistrationForm.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(submitRegistration.fulfilled, (state, action) => { state.status = action.payload })
      .addCase(getRegistrationStatus.fulfilled, (state, action) => { state.status = action.payload })
      .addCase(markCheckIn.fulfilled, (state, action) => { state.status = action.payload })
  }
})

export default registrationSlice.reducer