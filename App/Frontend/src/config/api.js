import axios from 'axios';

// API Configuration
// Safely access environment variables with fallback
const getEnvVar = (key, defaultValue) => {
  try {
    // Check if import.meta exists and has env property
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
    return defaultValue;
  } catch (e) {
    console.warn(`Failed to access environment variable ${key}, using default:`, defaultValue);
    return defaultValue;
  }
};

export const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api');

// Create axios instance
const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('mockUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export as default
export default apiService;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Users
  GET_USER_PROFILE: '/users/profile',
  UPDATE_USER_PROFILE: '/users/profile',
  GET_USER_BY_ID: (id) => `/users/${id}`,
  
  // Events
  GET_EVENTS: '/events',
  GET_EVENT_BY_ID: (id) => `/events/${id}`,
  CREATE_EVENT: '/events',
  UPDATE_EVENT: (id) => `/events/${id}`,
  DELETE_EVENT: (id) => `/events/${id}`,
  PUBLISH_EVENT: (id) => `/events/${id}/publish`,
  
  // Registrations
  GET_REGISTRATIONS: '/registrations',
  CREATE_REGISTRATION: '/registrations',
  UPDATE_REGISTRATION: (id) => `/registrations/${id}`,
  ACCEPT_REGISTRATION: (id) => `/registrations/${id}/accept`,
  REJECT_REGISTRATION: (id) => `/registrations/${id}/reject`,
  
  // Messages/Inbox
  GET_MESSAGES: '/messages',
  SEND_MESSAGE: '/messages',
  MARK_AS_READ: (id) => `/messages/${id}/read`,
  
  // Teams
  GET_TEAMS: '/teams',
  CREATE_TEAM: '/teams',
  UPDATE_TEAM: (id) => `/teams/${id}`,
  
  // Advertisements
  GET_ADS: '/advertisements',
  CREATE_AD: '/advertisements',
  UPDATE_AD: (id) => `/advertisements/${id}`,
  PUBLISH_AD: (id) => `/advertisements/${id}/publish`,
  
  // Analytics
  GET_EVENT_ANALYTICS: (id) => `/analytics/events/${id}`,
  GET_AD_ANALYTICS: (id) => `/analytics/ads/${id}`,
};