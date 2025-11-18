import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- THUNKS for Sponsor Ad Management ---

export const fetchSponsorAds = createAsyncThunk(
  'sponsorAds/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/sponsor/ads`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load ads');
    }
  }
);

export const createSponsorAd = createAsyncThunk(
  'sponsorAds/create',
  async (adData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/sponsor/ads`, adData);
      return response.data.ad;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create ad');
    }
  }
);

export const updateSponsorAd = createAsyncThunk(
  'sponsorAds/update',
  async ({ id, adData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE}/sponsor/ads/${id}`, adData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update ad');
    }
  }
);

export const deleteSponsorAd = createAsyncThunk(
  'sponsorAds/delete',
  async (adId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/sponsor/ads/${adId}`);
      return adId;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete ad');
    }
  }
);

export const publishSponsorAd = createAsyncThunk(
  'sponsorAds/publish',
  async (adId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE}/sponsor/ads/${adId}/publish`);
      return response.data.ad;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to publish ad');
    }
  }
);

const initialState = {
  ads: [],
  status: 'idle',
  error: null,
};

const sponsorAdsSlice = createSlice({
  name: 'sponsorAds',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const updateOrAddAd = (state, action) => {
      const ad = action.payload;
      const index = state.ads.findIndex((a) => a._id === ad._id);
      if (index !== -1) {
        state.ads[index] = ad;
      } else {
        state.ads.unshift(ad);
      }
    };

    builder
      .addCase(fetchSponsorAds.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchSponsorAds.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ads = action.payload;
      })
      .addCase(fetchSponsorAds.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createSponsorAd.fulfilled, updateOrAddAd)
      .addCase(updateSponsorAd.fulfilled, updateOrAddAd)
      .addCase(publishSponsorAd.fulfilled, updateOrAddAd)
      .addCase(deleteSponsorAd.fulfilled, (state, action) => {
        state.ads = state.ads.filter((ad) => ad._id !== action.payload);
      });
  },
});

export default sponsorAdsSlice.reducer;

