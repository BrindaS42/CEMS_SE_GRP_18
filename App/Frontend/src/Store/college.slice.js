import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const registerCollege = createAsyncThunk(
  'college/register',
  async (collegeData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/colleges/apply`, collegeData);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to register college';
      return rejectWithValue(message);
    }
  }
);

export const fetchAllApprovedColleges = createAsyncThunk(
  'college/fetchAllApproved',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/colleges/list/approved`);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to load colleges';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  list: [],
};

const collegeSlice = createSlice({
  name: 'college',
  initialState,
  reducers: {
    resetCollegeStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerCollege.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerCollege.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerCollege.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAllApprovedColleges.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllApprovedColleges.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchAllApprovedColleges.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetCollegeStatus } = collegeSlice.actions;
export default collegeSlice.reducer;