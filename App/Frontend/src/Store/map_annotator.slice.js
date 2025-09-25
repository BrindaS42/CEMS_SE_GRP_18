import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchEventLocation = createAsyncThunk(
  "mapAnnotator/fetchEventLocation",
  async (eventId, { rejectWithValue }) => {
    try {
      const url = `${API_BASE}/events/${encodeURIComponent(eventId)}/location`;
      const { data } = await axios.get(url);
      return data?.location || null;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to fetch location";
      return rejectWithValue(message);
    }
  }
);

export const saveEventLocation = createAsyncThunk(
  "mapAnnotator/saveEventLocation",
  async ({ eventId, location }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE}/events/${encodeURIComponent(eventId)}/location`;
      const { data } = await axios.post(url, { location });
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to save location";
      return rejectWithValue(message);
    }
  }
);

const mapAnnotatorSlice = createSlice({
  name: "mapAnnotator",
  initialState: {
    loading: false,
    saving: false,
    error: null,
    lastSaved: null,
    eventLocation: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchEventLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.eventLocation = action.payload;
      })
      .addCase(fetchEventLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch location";
      })
      .addCase(saveEventLocation.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveEventLocation.fulfilled, (state, action) => {
        state.saving = false;
        state.lastSaved = action.payload;
      })
      .addCase(saveEventLocation.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to save location";
      });
  },
});

export default mapAnnotatorSlice.reducer;

