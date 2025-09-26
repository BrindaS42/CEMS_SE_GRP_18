import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


// 1. Define the initial state (now with profile as null and added error state)
const initialState = {
  profile: null, // Set to null to indicate no data fetched yet
  loading: false,
  error: null,
};


// 2. Define the Async Thunks

// Thunk to fetch the organizer profile
export const fetchOrganizerProfile = createAsyncThunk(
  "organizer/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_BASE}/profile`);
        return response.data || null;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error || "Failed to fetch profile");
    }
  }
);

// Thunk to update the organizer profile
export const updateOrganizerProfile = createAsyncThunk(
  "organizer/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
        const response = await axios.put(`${API_BASE}/profile`, profileData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error || "Failed to update profile");
    }
  }
);


// 3. Create the Slice with extraReducers

const organizerSlice = createSlice({
  name: "organizer",
  initialState,
  // Add a simple reducer to handle clearing state (e.g., on logout)
  reducers: {
    clearProfile: (state) => {
        state.profile = null;
        state.loading = false;
        state.error = null;
    }
  },
  // extraReducers handles actions from outside the slice, like the thunks
  extraReducers: (builder) => {
    // --- Fetch Profile Handlers ---
    builder
      .addCase(fetchOrganizerProfile.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchOrganizerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // Set the profile data
      })
      .addCase(fetchOrganizerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the error message
        state.profile = null; // Ensure profile is null on failure
      })
    // --- Update Profile Handlers ---
      .addCase(updateOrganizerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganizerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // Update the profile with the returned data
      })
      .addCase(updateOrganizerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the error message
      });
  },
});

export const { clearProfile } = organizerSlice.actions;

// We export the reducer function, which will be used in our store.
export default organizerSlice.reducer;