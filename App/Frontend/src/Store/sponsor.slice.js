import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const fetchAllSponsors = createAsyncThunk('sponsor/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/sponsors/list`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load sponsors')
  }
})

export const fetchSponsorAds = createAsyncThunk('sponsor/fetchAds', async (sponsorId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/sponsors/${sponsorId}/ads`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load sponsor ads')
  }
})

const initialState = {
  sponsors: [],
  ads: [],
  loading: false,
  error: null,
}

const sponsorSlice = createSlice({
  name: 'sponsor',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSponsors.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAllSponsors.fulfilled, (state, action) => { state.loading = false; state.sponsors = action.payload })
      .addCase(fetchAllSponsors.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchSponsorAds.fulfilled, (state, action) => { state.ads = action.payload })
  }
})

export default sponsorSlice.reducer
