import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


export const fetchArrivals = createAsyncThunk('inbox/fetchArrivals', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/inbox/arrivals`);
    console.log("inbox controller",res.data.data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load arrivals');
  }
});

export const fetchSent = createAsyncThunk('inbox/fetchSent', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/inbox/sent`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load sent messages');
  }
});

export const fetchDrafts = createAsyncThunk('inbox/fetchDrafts', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/inbox/drafts`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load drafts');
  }
});

export const createDraft = createAsyncThunk('inbox/createDraft', async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/inbox/drafts`, payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to create draft');
  }
});

export const updateDraft = createAsyncThunk('inbox/updateDraft', async ({ draftId, payload }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_BASE}/inbox/drafts/${draftId}`, payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to update draft');
  }
});

export const sendMessage = createAsyncThunk('inbox/sendMessage', async (draftPayload, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_BASE}/inbox/drafts/${draftPayload._id}/send`, draftPayload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to send message');
  }
});

export const sendDirectMessage = createAsyncThunk('inbox/sendDirectMessage', async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/inbox/send`, payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to send message');
  }
});

export const deleteMessage = createAsyncThunk('inbox/deleteMessage', async (draftId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_BASE}/inbox/drafts/${draftId}`);
    return draftId;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to delete message');
  }
});

export const approveMessage = createAsyncThunk('inbox/approveMessage', async (messageId, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_BASE}/inbox/approve/${messageId}`);
    return { messageId, status: 'Approved' };
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to approve');
  }
});

export const rejectMessage = createAsyncThunk('inbox/rejectMessage', async (messageId, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_BASE}/inbox/reject/${messageId}`);
    return { messageId, status: 'Rejected' };
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to reject');
  }
});


// --- Slice Definition ---

const initialState = {
  arrivals: [],
  sent: [],
  drafts: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetching
      .addCase(fetchArrivals.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchArrivals.fulfilled, (state, action) => { state.status = 'succeeded'; state.arrivals = action.payload; })
      .addCase(fetchArrivals.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      
      .addCase(fetchSent.fulfilled, (state, action) => { state.sent = action.payload; })
      .addCase(fetchDrafts.fulfilled, (state, action) => { state.drafts = action.payload; })

      // Creating/Sending
      .addCase(createDraft.fulfilled, (state, action) => {
        state.drafts.unshift(action.payload);
      })
      .addCase(updateDraft.fulfilled, (state, action) => {
        const updatedDraft = action.payload;
        const index = state.drafts.findIndex(d => d._id === updatedDraft._id);
        if (index !== -1) {
          state.drafts[index] = updatedDraft;
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const sentMessage = action.payload;
        state.drafts = state.drafts.filter(d => d._id !== sentMessage._id);
        state.sent.unshift(sentMessage);
      })
      .addCase(sendDirectMessage.fulfilled, (state, action) => {
        state.sent.unshift(action.payload);
      })

      // Deleting
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.drafts = state.drafts.filter(d => d._id !== deletedId);
        state.sent = state.sent.filter(s => s._id !== deletedId);
        state.arrivals = state.arrivals.filter(a => a._id !== deletedId);
      })

      // Approving/Rejecting
      .addCase(approveMessage.fulfilled, (state, action) => {
        const { messageId, status } = action.payload;
        const message = state.arrivals.find(m => m._id === messageId);
        if (message) {
          message.status = status;
        }
      })
      .addCase(rejectMessage.fulfilled, (state, action) => {
        const { messageId, status } = action.payload;
        const message = state.arrivals.find(m => m._id === messageId);
        if (message) {
          message.status = status;
        }
      });
  },
});

export default inboxSlice.reducer;

/**
 * Note for integration:
 * 
 * 1. Add this slice to your Redux store configuration (e.g., in `src/store/index.js`):
 * 
 * import inboxReducer from './inbox.slice';
 * 
 * const store = configureStore({
 *   reducer: {
 *     // ... other reducers
 *     inbox: inboxReducer,
 *   },
 * });
 * 
 * 2. Ensure the backend routes for approve/reject are registered in `server.js`.
 *    (See the suggested changes for `server.js` in this response).
 */