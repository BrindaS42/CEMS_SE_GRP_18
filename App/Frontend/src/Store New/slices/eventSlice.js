import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventService } from '../../services/eventService.js';

const initialState = {
  events: [],
  currentEvent: null,
  trendingEvents: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  },
  filters: {
    search: '',
    categoryTags: [],
    sortBy: 'trending',
  },
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await eventService.getEvents(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await eventService.getEventById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTrendingEvents = createAsyncThunk(
  'events/fetchTrendingEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getTrendingEvents();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.events = action.payload.data;
        state.pagination = action.payload.pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Event By ID
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentEvent = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Trending Events
      .addCase(fetchTrendingEvents.fulfilled, (state, action) => {
        state.trendingEvents = action.payload;
      });
  },
});

export const { setFilters, clearCurrentEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
