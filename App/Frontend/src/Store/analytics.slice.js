import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchDashboardStats = createAsyncThunk('analytics/fetchStats', async (_, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${API_BASE}/analytics/stats`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err?.response?.data?.error || 'Failed to load stats');
    }
});

export const fetchEventWiseRatings = createAsyncThunk('analytics/fetchEventRatings', async (_, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${API_BASE}/analytics/event-ratings`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err?.response?.data?.error || 'Failed to load ratings');
    }
});

export const fetchAttendanceRatio = createAsyncThunk('analytics/fetchAttendanceRatio', async (_, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${API_BASE}/analytics/attendance-ratio`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err?.response?.data?.error || 'Failed to load attendance data');
    }
});

export const fetchEventPerformance = createAsyncThunk('analytics/fetchEventPerformance', async (_, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${API_BASE}/analytics/performance-overview`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err?.response?.data?.error || 'Failed to load performance data');
    }
});

const initialState = {
    stats: { totalEvents: 0, totalRegistrations: 0, avgAttendance: 0, avgRating: 0 },
    eventRatings: [],
    attendanceRatio: [],
    eventPerformance: [],
    status: 'idle',
    error: null,
};

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.status = 'succeeded'; state.stats = action.payload; })
            .addCase(fetchDashboardStats.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
            .addCase(fetchEventWiseRatings.fulfilled, (state, action) => { state.eventRatings = action.payload; })
            .addCase(fetchAttendanceRatio.fulfilled, (state, action) => { state.attendanceRatio = action.payload; })
            .addCase(fetchEventPerformance.fulfilled, (state, action) => { state.eventPerformance = action.payload; });
    },
});

export default analyticsSlice.reducer;