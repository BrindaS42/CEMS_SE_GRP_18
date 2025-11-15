import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const fetchDashboardEvents = createAsyncThunk('events/fetchDashboardAll', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load events')
  }
})

export const fetchPublishedEvents = createAsyncThunk('events/fetchPublished', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events/published`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load published')
  }
})

export const fetchDraftEvents = createAsyncThunk('events/fetchDrafts', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events/drafts`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load drafts')
  }
})

export const fetchCompletedEvents = createAsyncThunk('events/fetchCompleted', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/event/events/completed`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load completed events');
  }
});

export const fetchEventRegistrations = createAsyncThunk('events/fetchRegistrations', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events/${eventId}/registrations`)
    return { eventId, logs: res.data }
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load registrations')
  }
})

export const fetchEventCheckIns = createAsyncThunk('events/fetchCheckIns', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/events/${eventId}/checkins`)
    return { eventId, checkIns: res.data }
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load check-ins')
  }
})

export const fetchEventById = createAsyncThunk('events/fetchById', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/event/${eventId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to fetch event');
  }
});

export const createEventDraft = createAsyncThunk('events/createDraft', async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/event/save`, { ...payload, status: 'draft' })
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to save draft')
  }
})

export const updateEventDraft = createAsyncThunk('events/updateDraft', async (payload, { rejectWithValue }) => {
  try {
    // The backend saveEvent controller handles updates if _id is present
    const res = await axios.post(`${API_BASE}/event/save`, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to update draft');
  }
});

export const updateEventConfig = createAsyncThunk('events/updateConfig', async ({ eventId, config }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_BASE}/event/edit/${eventId}`, { config });
    return res.data.event;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to update registration config');
  }
});

export const publishEvent = createAsyncThunk('events/publish', async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/event/publish`, { ...payload, status: 'published' })
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to publish event')
  }
})

export const completeEvent = createAsyncThunk('events/complete', async (eventId, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_BASE}/event/complete/${eventId}`);
    return res.data.event;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to complete event');
  }
});

export const deleteEvent = createAsyncThunk('events/delete', async (eventId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_BASE}/event/delete/${eventId}`);
    return eventId;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to delete event');
  }
});

export const addAnnouncement = createAsyncThunk('events/addAnnouncement', async ({ eventId, payload }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/event/events/${eventId}/announcements`, payload);
    return res.data.event; // Assuming backend returns the updated event
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to add announcement');
  }
});

export const editAnnouncement = createAsyncThunk('events/editAnnouncement', async ({ eventId, announcementId, payload }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_BASE}/event/events/${eventId}/announcements/${announcementId}`, payload);
    return res.data.event;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to edit announcement');
  }
});

export const deleteAnnouncement = createAsyncThunk('events/deleteAnnouncement', async ({ eventId, announcementId }, { rejectWithValue }) => {
  try {
    const res = await axios.delete(`${API_BASE}/event/events/${eventId}/announcements/${announcementId}`);
    return res.data.event;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to delete announcement');
  }
});

export const fetchPotentialSubEvents = createAsyncThunk('events/fetchPotentialSubEvents', async (teamId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/event/sub-events/potential/${teamId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to fetch potential sub-events');
  }
});

const initialState = {
  all: [],
  published: [],
  drafts: [],
  completed: [],
  logsByEventId: {},
  checkInsByEventId: {},
  potentialSubEvents: [],
  status: 'idle',
  error: null,
}

const updateEventInState = (state, updatedEvent) => {
  const lists = ['all', 'published', 'drafts'];
  lists.forEach(list => {
    const index = state[list].findIndex(e => e._id === updatedEvent._id);
    if (index !== -1) {
      state[list][index] = updatedEvent;
    }
  });
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardEvents.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchDashboardEvents.fulfilled, (state, action) => { state.status = 'succeeded'; state.all = action.payload })
      .addCase(fetchDashboardEvents.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload })
      .addCase(fetchPublishedEvents.fulfilled, (state, action) => { state.published = action.payload })
      .addCase(fetchDraftEvents.fulfilled, (state, action) => { state.drafts = action.payload })
      .addCase(fetchCompletedEvents.fulfilled, (state, action) => { state.completed = action.payload })
      .addCase(fetchEventRegistrations.fulfilled, (state, action) => { state.logsByEventId[action.payload.eventId] = action.payload.logs })
      .addCase(fetchEventCheckIns.fulfilled, (state, action) => { state.checkInsByEventId[action.payload.eventId] = action.payload.checkIns })
      .addCase(createEventDraft.fulfilled, (state, action) => { const updatedEvent = action.payload.event;
        const index = state.drafts.findIndex(d => d._id === updatedEvent._id);
        if (index !== -1) {
          state.drafts[index] = updatedEvent;
        } else {
          state.drafts.unshift(updatedEvent);
        } })
      .addCase(updateEventDraft.fulfilled, (state, action) => {
        const updatedEvent = action.payload.event;
        const index = state.drafts.findIndex(d => d._id === updatedEvent._id);
        if (index !== -1) {
          state.drafts[index] = updatedEvent;
        }
      })
      .addCase(updateEventConfig.fulfilled, (state, action) => {
        updateEventInState(state, action.payload);
      })
      .addCase(publishEvent.fulfilled, (state, action) => { 
        const publishedEvent = action.payload.event;
        state.drafts = state.drafts.filter(d => d._id !== publishedEvent._id);
        const index = state.published.findIndex(p => p._id === publishedEvent._id);
        if (index !== -1) {
          state.published[index] = publishedEvent;
        } else {
          state.published.unshift(publishedEvent);
        }
       })
      .addCase(completeEvent.fulfilled, (state, action) => {
        const completedEvent = action.payload;
        state.published = state.published.filter(e => e._id !== completedEvent._id);
        state.completed.unshift(completedEvent);
       })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        const eventId = action.payload;
        state.all = state.all.filter(e => e._id !== eventId);
        state.drafts = state.drafts.filter(e => e._id !== eventId);
        state.published = state.published.filter(e => e._id !== eventId);
       })
      .addCase(fetchPotentialSubEvents.fulfilled, (state, action) => {
        state.potentialSubEvents = action.payload;
       })
      .addCase(addAnnouncement.fulfilled, (state, action) => {
        updateEventInState(state, action.payload);
      })
      .addCase(editAnnouncement.fulfilled, (state, action) => {
        updateEventInState(state, action.payload);
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        updateEventInState(state, action.payload);
      })
  }
})

export default eventsSlice.reducer
