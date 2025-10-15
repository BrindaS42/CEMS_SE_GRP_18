import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function setAuthToken(token) {
  if (token) {
    try { sessionStorage.setItem('token', token); } catch {}
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    try { sessionStorage.removeItem('token'); } catch {}
    delete axios.defaults.headers.common['Authorization'];
  }
}

let initialToken = null;
try {
  initialToken = sessionStorage.getItem('token');
  if (initialToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
  }
} catch {}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, payload);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.error || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, payload);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.error || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  user: null,
  token: initialToken,
  status: 'idle',
  error: null,
  isAuthenticated: Boolean(initialToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutSuccess(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      setAuthToken(null);
    },
    setUserFromPayload(state, action) {
      state.user = action.payload || null;
      state.isAuthenticated = Boolean(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const token = action.payload?.token;
        const user = action.payload?.user ?? null;
        if (token) {
          setAuthToken(token);
        }
        state.token = token ?? state.token ?? null;
        state.user = user;
        state.isAuthenticated = Boolean(token) || Boolean(user) || true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Registration failed';
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const token = action.payload?.token;
        const user = action.payload?.user ?? null;
        if (token) {
          setAuthToken(token);
        }
        state.token = token ?? state.token ?? null;
        state.user = user;
        state.isAuthenticated = Boolean(token) || Boolean(user) || true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      });
  },
});

export const { logoutSuccess, setUserFromPayload } = authSlice.actions;
export default authSlice.reducer;

