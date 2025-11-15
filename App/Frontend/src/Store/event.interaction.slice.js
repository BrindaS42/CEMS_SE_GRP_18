import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchAllMessages = createAsyncThunk(
  'eventInteraction/fetchAllMessages',
  async (eventId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/event/${eventId}/messages`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || 'Failed to fetch messages');
    }
  }
);


export const sendMessage = createAsyncThunk(
  'eventInteraction/sendMessage',
  async ({ eventId, message }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE}/event/${eventId}/message`, { message });
      return res.data; 
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || 'Failed to send message');
    }
  }
);


const initialState = {
  messages: [],
  status: 'idle', 
  error: null,
};

const eventInteractionSlice = createSlice({
  name: 'eventInteraction',
  initialState,
  
 
  reducers: {
    
    addMessage: (state, action) => {
      const newMessage = action.payload;
      const exists = state.messages.find(msg => msg._id === newMessage._id);
      if (!exists) {
        state.messages.push(newMessage);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMessages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload; 
      })
      .addCase(fetchAllMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(sendMessage.pending, (state) => {
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { addMessage, clearMessages } = eventInteractionSlice.actions;

export default eventInteractionSlice.reducer;