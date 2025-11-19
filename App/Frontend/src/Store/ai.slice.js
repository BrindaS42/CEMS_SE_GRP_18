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

export const queryChatBot = createAsyncThunk('ai/queryChatBot', async (query, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/ai/bot`, { query })
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to query chatbot')
  }
})

const initialState = {
  recommendations: [],
  chatHistory: [],
  loading: false,
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
      .addCase(queryChatBot.fulfilled, (state, action) => { 
        state.chatHistory.push({ type: 'bot', message: action.payload.answer })
      })
  }
})

export const { addChatMessage, clearChatHistory } = aiSlice.actions
export default aiSlice.reducer