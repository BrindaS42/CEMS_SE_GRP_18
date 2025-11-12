// src/services/authService.js
// Minimal mock authService for local/dev use.
// Delegates to registrationService & userService where available.

import { registrationService } from './registrationService';
import { userService } from './userService';

const makeToken = (payload = {}) => {
  // Create a lightweight base64 payload token (NOT secure — dev only)
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  // no signature
  return `${header}.${body}.`;
};

export const authService = {
  // Mock login: accept email/password/role, create token + store it
  login: async (email, password, role = 'student') => {
    // In a real app verify credentials; here we always succeed for demo
    const payload = { email, role };
    const token = makeToken(payload);

    // store token in localStorage (so userService can decode it)
    try {
      localStorage.setItem('authToken', token);
    } catch (e) {
      // ignore storage errors
    }

    // return shape similar to an API: { data: { user, token } } or token only
    const user = {
      _id: `user_${role}`,
      username: email.split('@')[0],
      email,
      role,
    };

    return Promise.resolve({ data: { user, token } });
  },

  // Mock register: delegate to registrationService if available
  register: async (userData) => {
    if (registrationService && typeof registrationService.createRegistration === 'function') {
      const resp = await registrationService.createRegistration(userData);
      // create token and save (so subsequent calls behave as logged-in)
      const token = makeToken({ email: userData.email, role: userData.role || 'student' });
      try {
        localStorage.setItem('authToken', token);
      } catch (e) {}
      // return created user-like object
      const user = {
        _id: resp.data._id || `user_${Date.now()}`,
        username: (userData.email || '').split('@')[0],
        email: userData.email,
        role: userData.role || 'student',
        college: userData.college || null,
      };
      return { data: { user, token } };
    }

    // If fallback not available, throw
    throw new Error('Registration service not available');
  },

  // For oauth simulated login
  oauthLogin: async (provider, token) => {
    // minimal mock — decode token payload if it's our simple token
    let payload = {};
    try {
      if (typeof token === 'string') {
        const parts = token.split('.');
        if (parts[1]) payload = JSON.parse(atob(parts[1]));
      }
    } catch {}
    const user = {
      _id: `user_oauth_${provider}`,
      username: payload.email ? payload.email.split('@')[0] : `${provider}_user`,
      email: payload.email || `${provider}@example.com`,
      role: payload.role || 'student',
    };
    const savedToken = makeToken({ email: user.email, role: user.role });
    try { localStorage.setItem('authToken', savedToken); } catch {}
    return { data: { user, token: savedToken } };
  },

  forgotPassword: async (email) => {
    // mock success
    return { data: { message: 'Password reset email sent (mock)' } };
  },

  changePassword: async (oldPassword, newPassword) => {
    // mock success
    return { data: { message: 'Password changed (mock)' } };
  },

  logout: () => {
    try {
      localStorage.removeItem('authToken');
    } catch (e) {}
  },
};
