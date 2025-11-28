import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const getRecommendations = createAsyncThunk('ai/getRecommendations', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/ai/recommend`)
    console.log('Fetched Recommendations:', res.data)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to get recommendations')
  }
})

export const getContentBasedRecommendations = createAsyncThunk('ai/getContentBasedRecommendations', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/ai/recommend/content-based`)
    console.log('Fetched Content-Based Recommendations:', res.data)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to get content-based recommendations')
  }
})

export const queryChatBot = createAsyncThunk('ai/queryChatBot', async (query, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/ai/bot`, { query })
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to query chatbot')
  }
})

export const rebuildIndex = createAsyncThunk('ai/rebuildIndex', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/ai/rebuild-index`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to rebuild index')
  }
})

const initialState = {
  recommendations: [],
  contentBasedRecommendations: [],
  chatHistory: [],
  loading: false,
  rebuilding: false,
  rebuildError: null,
  error: null,
}

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload)
    },
    clearChatHistory: (state) => {
      state.chatHistory = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRecommendations.pending, (state) => { state.loading = true; state.error = null })
      .addCase(getRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure recommendations is always an array, even if API returns unexpected data.
        state.recommendations = Array.isArray(action.payload?.recommendations) ? action.payload.recommendations : [];
      })
      .addCase(getRecommendations.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(getContentBasedRecommendations.pending, (state) => { state.loading = true; state.error = null })
      .addCase(getContentBasedRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.contentBasedRecommendations = Array.isArray(action.payload?.recommendations) ? action.payload.recommendations : [];
      })
      .addCase(getContentBasedRecommendations.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(queryChatBot.fulfilled, (state, action) => { 
        state.chatHistory.push({ type: 'bot', message: action.payload.answer })
      })
      .addCase(rebuildIndex.pending, (state) => {
        state.rebuilding = true;
        state.rebuildError = null;
      })
      .addCase(rebuildIndex.fulfilled, (state) => {
        state.rebuilding = false;
      })
      .addCase(rebuildIndex.rejected, (state, action) => {
        state.rebuilding = false; state.rebuildError = action.payload;
      })
  }
})

export const { addChatMessage, clearChatHistory } = aiSlice.actions
export default aiSlice.reducer