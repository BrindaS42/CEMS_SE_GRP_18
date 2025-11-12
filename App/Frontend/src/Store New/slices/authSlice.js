import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService.js';
import { authService } from '../../services/authService.js';
import { registrationService } from '../../services/registrationService.js'; // fallback for register

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      // authService expected to exist for login; if not, reject cleanly
      if (!authService || typeof authService.login !== 'function') {
        throw new Error('Authentication service not available');
      }
      const response = await authService.login(email, password, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message ?? 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Prefer authService.register if available, otherwise use registrationService.createRegistration
      if (authService && typeof authService.register === 'function') {
        const response = await authService.register(userData);
        return response.data;
      } else if (registrationService && typeof registrationService.createRegistration === 'function') {
        const response = await registrationService.createRegistration(userData);
        return response.data;
      } else {
        throw new Error('Registration service not available');
      }
    } catch (error) {
      return rejectWithValue(error?.message ?? 'Registration failed');
    }
  }
);

export const oauthLogin = createAsyncThunk(
  'auth/oauthLogin',
  async ({ provider, token }, { rejectWithValue }) => {
    try {
      if (!authService || typeof authService.oauthLogin !== 'function') {
        throw new Error('Authentication service not available');
      }
      const response = await authService.oauthLogin(provider, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'OAuth login failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      if (!authService || typeof authService.forgotPassword !== 'function') {
        throw new Error('Authentication service not available');
      }
      const response = await authService.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to send reset email');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      if (!authService || typeof authService.changePassword !== 'function') {
        throw new Error('Authentication service not available');
      }
      const response = await authService.changePassword(oldPassword, newPassword);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to change password');
    }
  }
);

export const loadUserProfile = createAsyncThunk(
  'auth/loadUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getCurrentUserProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to load profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (authService && typeof authService.logout === 'function') {
        authService.logout();
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const p = action.payload ?? {};
        const user =
          p.user ??
          p.data ??
          (typeof p === 'object' && Object.keys(p).length ? p : null);

        state.user = user;
        state.isAuthenticated = !!user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error?.message ?? 'Login failed';
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        const p = action.payload ?? {};
        const user =
          p.user ??
          p.data ??
          (typeof p === 'object' && Object.keys(p).length ? p : null);

        state.user = user;
        state.isAuthenticated = !!user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error?.message ?? 'Registration failed';
      })

      // OAuth Login
      .addCase(oauthLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(oauthLogin.fulfilled, (state, action) => {
        const p = action.payload ?? {};
        const user =
          p.user ??
          p.data ??
          (typeof p === 'object' && Object.keys(p).length ? p : null);

        state.user = user;
        state.isAuthenticated = !!user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(oauthLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error?.message ?? 'OAuth login failed';
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error?.message ?? 'Failed to send reset email';
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error?.message ?? 'Failed to change password';
      })

      // Load User Profile
      .addCase(loadUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.user = action.payload ?? null;
        state.isAuthenticated = !!state.user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error?.message ?? 'Failed to load profile';
        if (authService && typeof authService.logout === 'function') {
          authService.logout();
        }
      })

      // Update User Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload ?? state.user;
      });
  },
});

export const { setUser, logout, setLoading, clearError } = authSlice.actions;
export default authSlice.reducer;
