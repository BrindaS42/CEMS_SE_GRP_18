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

export const fetchSponsorById = createAsyncThunk('sponsor/fetchById', async (sponsorId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/sponsors/${sponsorId}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load sponsor details')
  }
})

export const fetchAdById = createAsyncThunk('sponsor/fetchAdById', async (adId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/sponsors/ads/${adId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load ad details');
  }
});

export const incrementAdView = createAsyncThunk('sponsor/incrementAdView', async (adId, { rejectWithValue }) => {
  try {
    // This is a "fire-and-forget" request, we don't need the response.
    await axios.patch(`${API_BASE}/sponsors/ads/${adId}/view`);
    return adId;
  } catch (err) {
    // Don't propagate error to UI, just log it.
    console.error('Failed to log view:', err);
    return rejectWithValue();
  }
});

export const toggleAdLike = createAsyncThunk('sponsor/toggleAdLike', async ({ adId, liked }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`${API_BASE}/sponsors/ads/${adId}/like`, { liked });
    return { adId, likes: res.data.likes };
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to update like');
  }
});

const initialState = {
  sponsors: [],
  selectedSponsor: null,
  ads: [],
  selectedAd: null,
  loading: false,
  error: null,
}

const sponsorSlice = createSlice({
  name: 'sponsor',
  initialState,
  reducers: {
    clearSelectedSponsor: (state) => {
      state.selectedSponsor = null;
      state.ads = [];
    },
    clearSelectedAd: (state) => {
      state.selectedAd = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSponsors.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAllSponsors.fulfilled, (state, action) => { state.loading = false; state.sponsors = action.payload })
      .addCase(fetchAllSponsors.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchSponsorAds.fulfilled, (state, action) => { state.ads = action.payload })
      // Add cases for fetching a single sponsor
      .addCase(fetchSponsorById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSponsorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSponsor = action.payload;
      })
      .addCase(fetchSponsorById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Add cases for fetching a single ad
      .addCase(fetchAdById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdById.fulfilled, (state, action) => { state.loading = false; state.selectedAd = action.payload; })
      .addCase(fetchAdById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Add cases for liking an ad
      .addCase(toggleAdLike.fulfilled, (state, action) => {
        if (state.selectedAd && state.selectedAd._id === action.payload.adId) {
          state.selectedAd.likes = action.payload.likes;
        }
      })
  }
})

export const { clearSelectedSponsor, clearSelectedAd } = sponsorSlice.actions;
export default sponsorSlice.reducer;
