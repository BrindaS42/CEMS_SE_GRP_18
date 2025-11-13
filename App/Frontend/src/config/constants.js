/**
 * Application-wide constants and configuration
 */

// Event Categories
export const EVENT_CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Competition',
  'Fest',
  'Exhibition',
  'Social',
  'Music',
  'Dance',
  'Drama',
  'Art',
  'Gaming',
  'Hackathon',
];

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  ORGANIZER: 'organizer',
  SPONSOR: 'sponsor',
  ADMIN: 'admin',
};

// Event Status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// Registration Status
export const REGISTRATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
};

// Payment Combos
export const PAYMENT_COMBOS = {
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

// Registration Types
export const REGISTRATION_TYPES = {
  SINGLE: 'single',
  DUO: 'duo',
  TEAM: 'team',
};

// Message Types
export const MESSAGE_TYPES = {
  GENERAL: 'general',
  ANNOUNCEMENT: 'announcement',
  INVITATION: 'invitation',
  REGISTRATION_REQUEST: 'registration_request',
};

// Auth Providers
export const AUTH_PROVIDERS = {
  JWT: 'jwt',
  GOOGLE: 'google',
  GITHUB: 'github',
};

// Team Member Roles
export const TEAM_ROLES = {
  CO_ORGANIZER: 'co-organizer',
  VOLUNTEER: 'volunteer',
  EDITOR: 'editor',
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  EVENT_LIST_LIMIT: 12,
  MESSAGE_LIST_LIMIT: 50,
  MAX_LIMIT: 100,
};

// Date Formats
export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy',
  SHORT: 'MMM dd, yyyy',
  TIME: 'HH:mm',
  DATETIME: 'MMMM dd, yyyy HH:mm',
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  LINKEDIN: 'linkedin',
  GITHUB: 'github',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
};

// Sort Options for Events
export const EVENT_SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'new', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'upcoming', label: 'Upcoming' },
];

// Colors by Role
export const ROLE_COLORS = {
  student: {
    primary: 'purple',
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
    background: 'from-purple-50 via-pink-50 to-orange-50',
    text: 'text-purple-600',
    bg: 'bg-purple-600',
  },
  organizer: {
    primary: 'indigo',
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    background: 'from-indigo-50 via-purple-50 to-pink-50',
    text: 'text-indigo-600',
    bg: 'bg-indigo-600',
  },
  sponsor: {
    primary: 'blue',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    background: 'from-blue-50 via-indigo-50 to-purple-50',
    text: 'text-blue-600',
    bg: 'bg-blue-600',
  },
  admin: {
    primary: 'red',
    gradient: 'from-red-600 via-orange-600 to-yellow-600',
    background: 'from-red-50 via-orange-50 to-yellow-50',
    text: 'text-red-600',
    bg: 'bg-red-600',
  },
};

// Navigation Links
export const NAV_LINKS = {
  PUBLIC: [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/about', label: 'About' },
  ],
  AUTHENTICATED: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/inbox', label: 'Inbox' },
    { path: '/profile', label: 'Profile' },
  ],
};

// Profile Sections
export const PROFILE_SECTIONS = {
  INFO: 'info',
  ACHIEVEMENTS: 'achievements',
  INTERESTS: 'interests',
  EVENTS: 'events',
};

// Event Detail Tabs
export const EVENT_TABS = {
  OVERVIEW: 'overview',
  TIMELINE: 'timeline',
  GALLERY: 'gallery',
  ANNOUNCEMENTS: 'announcements',
  WINNERS: 'winners',
  SUBMISSIONS: 'submissions',
  SCOREBOARD: 'scoreboard',
};

// Inbox Filters
export const INBOX_FILTERS = {
  ALL: 'all',
  UNREAD: 'unread',
  GENERAL: 'general',
  ANNOUNCEMENTS: 'announcement',
  INVITATIONS: 'invitation',
  REGISTRATIONS: 'registration_request',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  NOT_FOUND: 'The requested resource was not found.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  EVENT_CREATED: 'Event created successfully!',
  EVENT_UPDATED: 'Event updated successfully!',
  REGISTRATION_SUCCESS: 'Registration submitted successfully!',
  REGISTRATION_ACCEPTED: 'Registration accepted!',
  REGISTRATION_REJECTED: 'Registration rejected.',
  MESSAGE_SENT: 'Message sent successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// API Timeouts
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 60000, // 60 seconds
  LONG_OPERATION: 90000, // 90 seconds
};

// App Metadata
export const APP_META = {
  NAME: 'CEMS',
  FULL_NAME: 'College Event Management System',
  VERSION: '1.0.0',
  DESCRIPTION: 'A comprehensive platform for managing college events',
  SUPPORT_EMAIL: 'support@cems.edu',
};

// Feature Flags (for future features)
export const FEATURES = {
  CHAT_ENABLED: false,
  GAMIFICATION_ENABLED: false,
  MULTI_LANGUAGE: false,
  ONLINE_EVENTS: false,
  VIDEO_SUBMISSIONS: false,
  LIVE_STREAMING: false,
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
};

// Notification Settings
export const NOTIFICATIONS = {
  TOAST_DURATION: 3000, // 3 seconds
  AUTO_DISMISS: true,
  POSITION: 'top-right',
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#9333ea',
  SECONDARY: '#ec4899',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
};

// Default Avatar Colors
export const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};
