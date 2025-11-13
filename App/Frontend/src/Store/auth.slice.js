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
      const message = error?.response?.data?.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/logout`);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.error || 'Logout failed';
      return rejectWithValue(message);
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async ({ email, role } = {}, { rejectWithValue }) => {
    try {
      const payload = {};
      if (email && role) {
        payload.email = email;
        payload.role = role;
      }
      
      const response = await axios.post(`${API_BASE}/auth/password/request-reset`, payload);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Password reset request failed';
      return rejectWithValue(message);
    }
  }
);

export const verifyOtpAndResetPassword = createAsyncThunk(
  'auth/verifyOtpAndResetPassword',
  async ({ otp, newPassword, email, role }, { rejectWithValue }) => {
    try {
      const payload = { otp, newPassword };
      if (email && role) {
        payload.email = email;
        payload.role = role;
      }
      
      const response = await axios.post(`${API_BASE}/auth/password/confirm-reset`, payload);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Password reset failed';
      return rejectWithValue(message);
    }
  }
);

export const requestForgotPassword = createAsyncThunk(
  'auth/requestForgotPassword',
  async ({ email, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/password/forgot/request`, {
        email,
        role
      });
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Forgot password request failed';
      return rejectWithValue(message);
    }
  }
);

export const verifyForgotPassword = createAsyncThunk(
  'auth/verifyForgotPassword',
  async ({ email, role, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/password/forgot/verify`, {
        email,
        role,
        otp,
        newPassword
      });
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Password verification failed';
      return rejectWithValue(message);
    }
  }
);

export const generateOtpForAccount = createAsyncThunk(
  'auth/generateOtpForAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/verification/account/request`);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.error || 'OTP generation failed';
      return rejectWithValue(message);
    }
  }
);

export const verifyOtpForAccount = createAsyncThunk(
  'auth/verifyOtpForAccount',
  async ({ otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/verification/account/verify`, {
        otp
      });
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.error || 'Account verification failed';
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
  passwordResetStatus: 'idle',
  accountVerificationStatus: 'idle',
  forgotPasswordStatus: 'idle',
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
      state.passwordResetStatus = 'idle';
      state.accountVerificationStatus = 'idle';
      state.forgotPasswordStatus = 'idle';
      setAuthToken(null);
    },
    setUserFromPayload(state, action) {
      state.user = action.payload || null;
      state.isAuthenticated = Boolean(action.payload);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
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
      
      // Login
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
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
        setAuthToken(null);
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout fails on server, clear local state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = action.payload;
        setAuthToken(null);
      })
      
      // Password Reset (Authenticated)
      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordResetStatus = 'loading';
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.passwordResetStatus = 'otp-sent';
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordResetStatus = 'failed';
        state.error = action.payload;
      })
      
      .addCase(verifyOtpAndResetPassword.pending, (state) => {
        state.passwordResetStatus = 'loading';
        state.error = null;
      })
      .addCase(verifyOtpAndResetPassword.fulfilled, (state) => {
        state.passwordResetStatus = 'success';
      })
      .addCase(verifyOtpAndResetPassword.rejected, (state, action) => {
        state.passwordResetStatus = 'failed';
        state.error = action.payload;
      })
      
      // Forgot Password (Unauthenticated)
      .addCase(requestForgotPassword.pending, (state) => {
        state.forgotPasswordStatus = 'loading';
        state.error = null;
      })
      .addCase(requestForgotPassword.fulfilled, (state) => {
        state.forgotPasswordStatus = 'otp-sent';
      })
      .addCase(requestForgotPassword.rejected, (state, action) => {
        state.forgotPasswordStatus = 'failed';
        state.error = action.payload;
      })
      
      .addCase(verifyForgotPassword.pending, (state) => {
        state.forgotPasswordStatus = 'loading';
        state.error = null;
      })
      .addCase(verifyForgotPassword.fulfilled, (state) => {
        state.forgotPasswordStatus = 'success';
      })
      .addCase(verifyForgotPassword.rejected, (state, action) => {
        state.forgotPasswordStatus = 'failed';
        state.error = action.payload;
      })
      
      // Account Verification
      .addCase(generateOtpForAccount.pending, (state) => {
        state.accountVerificationStatus = 'loading';
        state.error = null;
      })
      .addCase(generateOtpForAccount.fulfilled, (state) => {
        state.accountVerificationStatus = 'otp-sent';
      })
      .addCase(generateOtpForAccount.rejected, (state, action) => {
        state.accountVerificationStatus = 'failed';
        state.error = action.payload;
      })
      
      .addCase(verifyOtpForAccount.pending, (state) => {
        state.accountVerificationStatus = 'loading';
        state.error = null;
      })
      .addCase(verifyOtpForAccount.fulfilled, (state) => {
        state.accountVerificationStatus = 'verified';
        if (state.user) {
          state.user.isVerified = true;
        }
      })
      .addCase(verifyOtpForAccount.rejected, (state, action) => {
        state.accountVerificationStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logoutSuccess, setUserFromPayload, clearError } = authSlice.actions;
export default authSlice.reducer;
