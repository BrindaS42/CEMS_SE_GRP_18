import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- THUNKS for College Management ---

export const fetchAllCollegesForAdmin = createAsyncThunk(
  'admin/fetchAllColleges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/colleges`);
      console.log("admin controller",response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load colleges');
    }
  }
);

export const approveCollege = createAsyncThunk(
  'admin/approveCollege',
  async (collegeId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE}/admin/colleges/${collegeId}/handle`, { status: 'Approved' });
      return response.data.college;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to approve college');
    }
  }
);

export const rejectCollege = createAsyncThunk(
  'admin/rejectCollege',
  async (collegeId, { rejectWithValue }) => {
    try {
      await axios.patch(`${API_BASE}/admin/colleges/${collegeId}/handle`, { status: 'Rejected' });
      return collegeId; // Return ID to remove from state
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to reject college');
    }
  }
);

export const suspendCollege = createAsyncThunk(
  'admin/suspendCollege',
  async (collegeId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE}/admin/colleges/${collegeId}/suspend`);
      return { collegeId, status: 'Suspended' };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to suspend college');
    }
  }
);

export const unsuspendCollege = createAsyncThunk(
  'admin/unsuspendCollege',
  async (collegeId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE}/admin/colleges/${collegeId}/unsuspend`);
      return { collegeId, status: 'Approved' };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to unsuspend college');
    }
  }
);

// --- THUNKS for Other Entities ---

export const fetchAllEventsForAdmin = createAsyncThunk(
  'admin/fetchAllEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/events`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load events');
    }
  }
);

export const fetchAllUsersForAdmin = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/users`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load users');
    }
  }
);

export const fetchAllAdsForAdmin = createAsyncThunk(
  'admin/fetchAllAds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/ads`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load ads');
    }
  }
);

export const toggleEntitySuspension = createAsyncThunk(
  'admin/toggleSuspension',
  async ({ modelType, id, targetStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE}/admin/suspend/${modelType}/${id}`, { targetStatus });
      return {
        modelType,
        updatedDoc: response.data.document
      };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || `Failed to update ${modelType} status`);
    }
  }
);

export const createReport = createAsyncThunk(
  'admin/createReport',
  async ({ modelType, id, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/report/${modelType}/${id}`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || `Failed to file report`);
    }
  }
);


const initialState = {
  colleges: [],
  events: [],
  users: [],
  ads: [],
  status: 'idle',
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const updateCollegeStatus = (state, action) => {
      const index = state.colleges.findIndex(c => c._id === action.payload.collegeId);
      if (index !== -1) {
        state.colleges[index].status = action.payload.status;
      }
    };

    const updateEntityStatus = (state, action) => {
      const { modelType, updatedDoc } = action.payload;
      const listKey = `${modelType}s`; // e.g., 'events', 'users', 'ads'
      
      if (state[listKey]) {
        const index = state[listKey].findIndex(item => item._id === updatedDoc._id);
        if (index !== -1) {
          // Update the status of the specific item
          state[listKey][index].status = updatedDoc.status;
        }
      }
    };

    builder
      .addCase(fetchAllCollegesForAdmin.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAllCollegesForAdmin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log("Fetched colleges:", action.payload);
        state.colleges = action.payload;
      })
      .addCase(fetchAllCollegesForAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(approveCollege.fulfilled, (state, action) => {
        const index = state.colleges.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.colleges[index] = action.payload;
      })
      .addCase(rejectCollege.fulfilled, (state, action) => {
        state.colleges = state.colleges.filter(c => c._id !== action.payload);
      })
      .addCase(suspendCollege.fulfilled, updateCollegeStatus)
      .addCase(unsuspendCollege.fulfilled, updateCollegeStatus)
      // Reducers for other entities
      .addCase(fetchAllEventsForAdmin.fulfilled, (state, action) => {
        state.events = action.payload;
      })
      .addCase(fetchAllUsersForAdmin.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchAllAdsForAdmin.fulfilled, (state, action) => {
        state.ads = action.payload;
      })
      .addCase(toggleEntitySuspension.fulfilled, (state, action) => {
        const { modelType, updatedDoc } = action.payload;
        const listKey = `${modelType}s`; // 'events', 'users', 'ads'
        const index = state[listKey]?.findIndex(item => item._id === updatedDoc._id);
        if (index > -1) {
          state[listKey][index].status = updatedDoc.status;
        }
      });
  },
});

export default adminSlice.reducer;