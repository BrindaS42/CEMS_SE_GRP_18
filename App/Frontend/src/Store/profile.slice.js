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

// Thunk to fetch the user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_BASE}/profile`);
        return response.data || null;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error || "Failed to fetch profile");
    }
  }
);

// Thunk to update the user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
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

const userSlice = createSlice({
  name: "user",
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
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // Set the profile data
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the error message
        state.profile = null; // Ensure profile is null on failure
      })
    // --- Update Profile Handlers ---
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // Update the profile with the returned data
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the error message
      });
  },
});

export const { clearProfile } = userSlice.actions;

// We export the reducer function, which will be used in our store.
export default userSlice.reducer;
